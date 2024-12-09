import json
import boto3
import os

# Initialize the DynamoDB client
dynamodb = boto3.client('dynamodb')
table_name = os.environ.get('tableName', 'unknown_table')

def main(event, context):
    try:
        # Query DynamoDB for items where PK = 'aggregates'
        response = dynamodb.query(
            TableName=table_name,
            KeyConditionExpression='PK = :pk',
            ExpressionAttributeValues={':pk': {'S': 'aggregates'}}
        )

        # Extract the items from the response
        aggregates = response.get('Items', [])
        
        # Find student_count item
        student_count_item = next(
            (item for item in aggregates if item['SK']['S'] == 'student_count'), None
        )
        student_count = int(student_count_item['value']['N']) if student_count_item else 0

        # Find avg_overall_avg item (if exists)
        avg_overall_avg_item = next(
            (item for item in aggregates if item['SK']['S'] == 'avg_overall_avg'), None
        )
        avg_overall_avg = float(avg_overall_avg_item['value']['N']) if avg_overall_avg_item else 0.0

        # Return the result
        return {
            'statusCode': 200,
            'body': json.dumps({'student_count': student_count, 'avg_overall_avg': avg_overall_avg}),
            'headers': {'Content-Type': 'application/json'}
        }

    except Exception as e:
        # Return an error message if there's an issue
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not fetch aggregates'}),
            'headers': {'Content-Type': 'application/json'}
        }
