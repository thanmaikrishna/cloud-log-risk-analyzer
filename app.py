from flask import Flask, jsonify
import boto3
import json
import gzip
from io import BytesIO
import config
from risk_classifier import classify_risk

app = Flask(__name__)

# Create Boto3 session
session = boto3.session.Session(
    aws_access_key_id=config.AWS_ACCESS_KEY,
    aws_secret_access_key=config.AWS_SECRET_KEY,
    region_name=config.AWS_REGION
)
s3 = session.client("s3")


@app.route("/api/fetch_logs")
def fetch_logs():
    prefix = config.AWS_LOGS_PREFIX
    bucket = config.AWS_BUCKET_NAME

    # Debug print statements
    print(f"Checking bucket: {bucket}")
    print(f"Using prefix: {prefix}")

    try:
        objects = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
    except Exception as e:
        return jsonify({"error": f"Failed to list objects: {str(e)}"}), 500

    if "Contents" not in objects or len(objects["Contents"]) == 0:
        return jsonify({"error": "No logs found in the specified prefix."}), 404

    # Get latest file
    latest_file = sorted(objects["Contents"], key=lambda x: x["LastModified"], reverse=True)[0]
    print(f"Fetching log file: {latest_file['Key']}")

    try:
        data = s3.get_object(Bucket=bucket, Key=latest_file["Key"])["Body"].read()
        with gzip.GzipFile(fileobj=BytesIO(data)) as f:
            log_data = json.loads(f.read().decode("utf-8"))
    except Exception as e:
        return jsonify({"error": f"Failed to read or parse log: {str(e)}"}), 500

    results = []
    for event in log_data.get("Records", []):
        risk_level, reason = classify_risk(event)
        results.append({
            "eventTime": event.get("eventTime"),
            "eventName": event.get("eventName"),
            "sourceIP": event.get("sourceIPAddress"),
            "riskLevel": risk_level,
            "reason": reason
        })

    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)
