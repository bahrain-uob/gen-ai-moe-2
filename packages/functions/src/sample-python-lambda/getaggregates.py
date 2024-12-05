import json
import boto3
import os

# Initialize the DynamoDB client
dynamodb = boto3.client('dynamodb')
table_name = os.environ['tableName']

def main(event, context):
    try:
        # Validate the HTTP method
        if event['httpMethod'] != 'GET':
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'}),
                'headers': {
                    'Content-Type': 'application/json',
                }
            }

        # Query to retrieve the 'aggregates' row
        response = dynamodb.query(
            TableName=table_name,
            KeyConditionExpression='PK = :pk',
            ExpressionAttributeValues={
                ':pk': {'S': 'aggregates'}
            }
        )

        aggregates = response.get('Items', [])
        student_count = int(aggregates[0].get('student_count', {'N': '0'})['N']) if aggregates else 0
        avg_overall_avg = float(aggregates[0].get('avg_overall_avg', {'N': '0'})['N']) if aggregates else 0.0

        return {
            'statusCode': 200,
            'body': json.dumps({
                'student_count': student_count,
                'avg_overall_avg': avg_overall_avg
            }),
            'headers': {
                'Content-Type': 'application/json',
            }
        }
    except Exception as e:
        print(f"Error fetching aggregates: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not fetch aggregates'}),
            'headers': {
                'Content-Type': 'application/json',
            }
        }
