import boto3
import botocore
import json
import io

def fetch_aws_logs_securely(access_key, secret_key, region, bucket, path):
    try:
        # Create boto3 S3 client securely
        s3 = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
            config=botocore.client.Config(signature_version='s3v4')
        )
        # List objects under path prefix
        objects = s3.list_objects_v2(Bucket=bucket, Prefix=path)
        if 'Contents' not in objects:
            return [], 'No logs found at specified path'
        logs = []
        for obj in objects['Contents']:
            file_obj = s3.get_object(Bucket=bucket, Key=obj['Key'])
            file_content = file_obj['Body'].read()
            # Parse JSON log lines (assuming each file contains JSON logs)
            try:
                json_logs = json.loads(file_content)
                if isinstance(json_logs, list):
                    logs.extend(json_logs)
                else:
                    logs.append(json_logs)
            except Exception as e:
                # If logs are newline-delimited JSON (NDJSON)
                try:
                    for line in file_content.decode('utf-8').splitlines():
                        logs.append(json.loads(line))
                except Exception as ex:
                    # Could not parse logs, skip this file
                    continue
        return logs, None
    except Exception as e:
        return None, f'Error fetching logs from AWS: {str(e)}'
