import boto3
import os 

s3_client = boto3.client(
    service_name ="s3",
    endpoint_url = os.environ.get("CLOUDFLARE_R2_ENDPOINT"),
    aws_access_key_id = os.environ.get("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    aws_secret_access_key = os.environ.get("CLOUDFLARE_R2_SECRET_KEY"),
    region_name="auto",
)