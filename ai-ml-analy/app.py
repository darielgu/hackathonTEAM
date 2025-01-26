import boto3
import json

bedrock_runtime = boto3.client('bedrock-runtime', region_name = 'us-west-2')

prompt = "What is the capital city of the United States?"

kwargs = {
  "modelId": "anthropic.claude-3-haiku-20240307-v1:0",
  "contentType": "application/json",
  "accept": "application/json",
  "body": json.dumps({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1000,
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": prompt
          }
        ]
      }
    ]
  })
}


response = bedrock_runtime.invoke_model(**kwargs)

body = json.loads(response.get('body').read())

print(body)