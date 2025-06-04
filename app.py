from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from auth_utils import authenticate_user, register_user, token_required
from aws_log_handler import fetch_aws_logs_securely
from risk_classifier import classify_logs
import json
import os
from config import SECRET_KEY
import boto3
from botocore.exceptions import ClientError
from risk_classifier import classify_log_entry
import gzip
import io


app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

app.config['SECRET_KEY'] = 'your_very_secure_secret_key_here'

# Route: User Registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    success, message = register_user(email, password)
    if success:
        return jsonify({'message': message}), 200  # ✅ ensure 200 on success
    else:
        return jsonify({'message': message}), 400

# Route: User Login - returns JWT token
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400
    user = authenticate_user(email, password)
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    # Create JWT token valid for 1 hour
    token = jwt.encode(
    {'email': email, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
    app.config['SECRET_KEY'],
    algorithm='HS256'
    )
    if isinstance(token, bytes):  # decode bytes to string
        token = token.decode('utf-8')
    return jsonify({'token': token})

# Route: Get User Info (Protected)
@app.route('/api/user', methods=['GET'])
@token_required
def user_info(current_user):
    return jsonify({'email': current_user})

# Route: Update Password (Protected)
@app.route('/api/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')
    if not old_password or not new_password:
        return jsonify({'message': 'Old and new passwords required'}), 400
    # Verify old password
    if not authenticate_user(current_user, old_password):
        return jsonify({'message': 'Old password incorrect'}), 401
    # Change password
    success, message = register_user(current_user, new_password, update=True)
    if not success:
        return jsonify({'message': message}), 400
    return jsonify({'message': 'Password changed successfully'})

# Route: Fetch logs and analyze (Protected)
@app.route('/api/fetch-analyze', methods=['POST'])
@token_required
def fetch_and_analyze(current_user):
    data = request.get_json()
    aws_access_key = data.get('awsAccessKey')
    aws_secret_key = data.get('awsSecretKey')
    aws_region = data.get('awsRegion')
    s3_bucket = data.get('s3Bucket')
    s3_path = data.get('s3Path')

    # Validate inputs
    if not all([aws_access_key, aws_secret_key, aws_region, s3_bucket, s3_path]):
        return jsonify({'message': 'AWS credentials, region, bucket, and path are required'}), 400

    # Fetch logs securely from AWS S3
    logs, err = fetch_aws_logs_securely(
        aws_access_key, aws_secret_key, aws_region, s3_bucket, s3_path
    )
    if err:
        return jsonify({'message': err}), 500

    # Load rules
    predefined_rules_path = os.path.join('rules', 'predefined_rules.json')
    custom_rules_path = os.path.join('rules', 'custom_rules.json')

    with open(predefined_rules_path) as f:
        predefined_rules = json.load(f)
    with open(custom_rules_path) as f:
        custom_rules = json.load(f)

    # Classify logs with both rule sets
    classified_results = classify_logs(logs, predefined_rules, custom_rules)

    return jsonify({'results': classified_results})

# Route: Get rules (Protected)
@app.route('/api/rules', methods=['GET'])
@token_required
def get_rules(current_user):
    predefined_rules_path = os.path.join('rules', 'predefined_rules.json')
    custom_rules_path = os.path.join('rules', 'custom_rules.json')

    with open(predefined_rules_path) as f:
        predefined_rules = json.load(f)
    with open(custom_rules_path) as f:
        custom_rules = json.load(f)

    # Send predefined rules as readonly
    # Send custom rules editable by user
    return jsonify({
        'predefinedRules': predefined_rules,
        'customRules': custom_rules
    })

# Route: Update custom rules (Protected)
@app.route('/api/rules/custom', methods=['POST'])
@token_required
def update_custom_rules(current_user):
    data = request.get_json()
    new_rules = data.get('customRules')
    if not isinstance(new_rules, list):
        return jsonify({'message': 'Invalid rules format'}), 400
    custom_rules_path = os.path.join('rules', 'custom_rules.json')
    try:
        with open(custom_rules_path, 'w') as f:
            json.dump(new_rules, f, indent=2)
    except Exception as e:
        return jsonify({'message': f'Error saving rules: {str(e)}'}), 500
    return jsonify({'message': 'Custom rules updated successfully'})

@app.route('/api/connect-aws', methods=['POST'])
def connect_aws():
    data = request.json
    access_key = data.get('accessKey')
    secret_key = data.get('secretKey')
    region = data.get('region')
    log_path = data.get('logPath')

    if not all([access_key, secret_key, region, log_path]):
        return jsonify({'message': 'Missing AWS credentials, region or log path'}), 400

    if not log_path.startswith('s3://'):
        return jsonify({'message': 'Log path must start with s3://'}), 400

    try:
        # ✅ Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )

        # ✅ Parse bucket and prefix
        path_parts = log_path[5:].split('/', 1)
        bucket = path_parts[0]
        prefix = path_parts[1] if len(path_parts) > 1 else ''

        # ✅ List objects to verify path
        response = s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix, MaxKeys=10)

        if 'Contents' not in response:
            return jsonify({'message': 'No logs found at specified path'}), 404

        logs = []
        for obj in response['Contents']:
            key = obj['Key']
            file_obj = s3_client.get_object(Bucket=bucket, Key=key)
            raw_data = file_obj['Body'].read()

            try:
                # ✅ Decompress if GZIP
                if key.endswith('.gz') or raw_data[:2] == b'\x1f\x8b':
                    with gzip.GzipFile(fileobj=io.BytesIO(raw_data)) as gz:
                        file_content = gz.read().decode('utf-8')
                else:
                    file_content = raw_data.decode('utf-8')
            except Exception as e:
                return jsonify({'message': f'Error reading file {key}: {str(e)}'}), 500

            for line in file_content.splitlines():
                try:
                    data = json.loads(line)
                    records = data.get('Records', [])
                    for record in records:
                        event_name = record.get('eventName', 'N/A')
                        risk, reason = classify_log_entry(record)
                        logs.append({
                            'eventName': event_name,
                            'risk': risk,
                            'reason': reason
                        })
                except Exception:
                    continue


        return jsonify({
            'message': 'AWS connection and log path verified successfully',
            'logs': logs
        })

    except ClientError as e:
        return jsonify({'message': f'AWS error: {e.response["Error"]["Message"]}'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/classify-logs', methods=['POST'])
@token_required
def classify_logs_route(current_user):
    data = request.json
    access_key = data.get('access_key')
    secret_key = data.get('secret_key')
    region = data.get('region')
    log_path = data.get('log_path')

    if not log_path or not log_path.startswith('s3://'):
        return jsonify({'error': 'Log path must start with s3://'}), 400

    bucket = log_path.replace('s3://', '').split('/')[0]
    prefix = '/'.join(log_path.replace('s3://', '').split('/')[1:])

    # Initialize S3 client once
    s3_client = boto3.client(
        's3',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region
    )

    logs = []  # Initialize once here

    try:
        response = s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)

        if 'Contents' not in response:
            return jsonify({'error': 'No logs found at specified path'}), 404

        for obj in response['Contents']:
            key = obj['Key']
            file_obj = s3_client.get_object(Bucket=bucket, Key=key)
            raw_data = file_obj['Body'].read()

            try:
                # Check gzip by extension or magic bytes
                if key.endswith('.gz') or raw_data[:2] == b'\x1f\x8b':
                    with gzip.GzipFile(fileobj=io.BytesIO(raw_data)) as gz:
                        file_content = gz.read().decode('utf-8')
                else:
                    file_content = raw_data.decode('utf-8')
            except Exception as e:
                return jsonify({'message': f'Error reading file {key}: {str(e)}'}), 500

            # Parse each line (each line is a JSON object with Records list)
            for line in file_content.splitlines():
                try:
                    data = json.loads(line)
                    records = data.get('Records', [])
                    for record in records:
                        event_name = record.get('eventName', 'N/A')
                        risk, reason = classify_log_entry(record)
                        logs.append({
                            'eventName': event_name,
                            'risk': risk,
                            'reason': reason
                        })
                except Exception as e:
                    print(f"Error processing line: {e}")
                    continue

        # --- Add your classified results summary here ---
        print("Classified results summary:")
        risk_counts = {"Low": 0, "Medium": 0, "High": 0}
        for entry in logs:
            risk_counts[entry['risk']] = risk_counts.get(entry['risk'], 0) + 1
        print(risk_counts)

        return jsonify({'logs': logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# app.py (Flask backend)
@app.route('/fetch-logs', methods=['POST'])
#@jwt_required()
def fetch_logs():
    data = request.get_json()
    access_key = data.get('access_key')
    secret_key = data.get('secret_key')
    region = data.get('region')
    s3_path = data.get('s3_path')

    # Perform fetching and analyzing logic here...

    return jsonify({"message": "Logs successfully fetched and analyzed."})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
