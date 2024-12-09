

import boto3
import json
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')

# Table names
USERDATA_TABLE = 'asareer-codecatalyst-sst-app-UserData'
RECORDS_TABLE = 'asareer-codecatalyst-sst-app-Records'

def main(event, context):
    # Access the DynamoDB tables
    userdata_table = dynamodb.Table(USERDATA_TABLE)
    records_table = dynamodb.Table(RECORDS_TABLE)

    # Initialize variables for aggregating scores
    total_reading_score = Decimal(0)
    total_listening_score = Decimal(0)
    total_overall_avg = Decimal(0)
    student_count = 0

    # Iterate over Records in the event
    for record in event['Records']:
        # Check for INSERT event and presence of readingAnswer in the NewImage
        if record['eventName'] == "INSERT" and "NewImage" in record['dynamodb']:
            try:
                # Retrieve the PK and SK from the record
                primarykey = record['dynamodb']['Keys']['PK']['S']
                sortkey = record['dynamodb']['Keys']['SK']['S']  # Retrieve the sort key

                # Extract the BandScore from readingAnswer
                reading_bandscore = int(record['dynamodb']['NewImage']['readingAnswer']['M']['feedback']['M']['BandScore']['N'])
                # Extract the BandScore from listeningAnswer
                listening_bandscore = int(record['dynamodb']['NewImage']['listeningAnswer']['M']['feedback']['M']['BandScore']['N'])

                # Retrieve the user's current scores (query by PK and SK)
                response = userdata_table.get_item(Key={'PK': primarykey, 'SK': sortkey})
                if 'Item' not in response:
                    print(f"User with PK {primarykey} and SK {sortkey} not found in UserData table.")
                    continue

                # Process Reading BandScore
                current_reading_score = int(response['Item'].get('readingbandscore', 0))
                new_reading_score = (current_reading_score + reading_bandscore) / 2

                # Update the readingbandscore using PK and SK
                userdata_table.update_item(
                    Key={'PK': primarykey, 'SK': sortkey},  # Use both PK and SK
                    UpdateExpression='SET readingbandscore = :val',
                    ExpressionAttributeValues={':val': Decimal(str(new_reading_score))}
                )
                print(f"Updated readingbandscore for {primarykey} and {sortkey} to {new_reading_score}")

                # Process Listening BandScore
                current_listening_score = int(response['Item'].get('Listeningbandscore', 0))
                new_listening_score = (current_listening_score + listening_bandscore) / 2

                # Update the Listeningbandscore using PK and SK
                userdata_table.update_item(
                    Key={'PK': primarykey, 'SK': sortkey},  # Use both PK and SK
                    UpdateExpression='SET Listeningbandscore = :val',
                    ExpressionAttributeValues={':val': Decimal(str(new_listening_score))}
                )
                print(f"Updated Listeningbandscore for {primarykey} and {sortkey} to {new_listening_score}")

                # Calculate overall average
                overallaverage = (new_reading_score + new_listening_score) / 2

                # Update the overallavg using PK and SK
                userdata_table.update_item(
                    Key={'PK': primarykey, 'SK': sortkey},  # Use both PK and SK
                    UpdateExpression='SET overallavg = :val',
                    ExpressionAttributeValues={':val': Decimal(str(overallaverage))}
                )
                print(f"Updated overallavg for {primarykey} and {sortkey} to {overallaverage}")

            except Exception as e:
                print(f"Error processing record for PK {primarykey} and SK {sortkey}: {e}")

    # Now calculate aggregates for all students
    try:
        # Scan the UserData table to retrieve all items and calculate student_count
        response = userdata_table.scan()
        items = response.get('Items', [])

        # Count the number of records in UserData table (i.e., the number of students)
        student_count = len(items)

        # Loop through all items to compute aggregates
        total_reading_score = Decimal(0)
        total_listening_score = Decimal(0)
        total_overall_avg = Decimal(0)

        for item in items:
            total_reading_score += Decimal(str(item.get('readingbandscore', 0)))
            total_listening_score += Decimal(str(item.get('Listeningbandscore', 0)))
            total_overall_avg += Decimal(str(item.get('overallavg', 0)))

        # Calculate the averages
        avg_reading_score = total_reading_score / student_count if student_count > 0 else Decimal(0)
        avg_listening_score = total_listening_score / student_count if student_count > 0 else Decimal(0)
        avg_overall_avg = total_overall_avg / student_count if student_count > 0 else Decimal(0)

        # Prepare aggregates for update
        aggregates = [
            {
                'PK': 'aggregates',
                'SK': 'avg_reading_score',
                'value': avg_reading_score,
                'description': 'Average Reading BandScore'
            },
            {
                'PK': 'aggregates',
                'SK': 'avg_listening_score',
                'value': avg_listening_score,
                'description': 'Average Listening BandScore'
            },
            {
                'PK': 'aggregates',
                'SK': 'avg_overall_avg',
                'value': avg_overall_avg,
                'description': 'Average Overall Average'
            },
            {
                'PK': 'aggregates',
                'SK': 'student_count',
                'value': Decimal(student_count),  # Save the student count as an aggregate
                'description': 'Total Student Count'
            }
        ]

        # Update aggregate records in the Records table
        for aggregate in aggregates:
            try:
                # Update existing aggregate record using PK and SK
                records_table.update_item(
                    Key={'PK': aggregate['PK'], 'SK': aggregate['SK']},  # Use both PK and SK
                    UpdateExpression='SET #val = :v, description = :d',
                    ExpressionAttributeNames={
                        '#val': 'value'  # Alias for the reserved keyword
                    },
                    ExpressionAttributeValues={
                        ':v': aggregate['value'],
                        ':d': aggregate['description']
                    }
                )
                print(f"Updated existing aggregate: {aggregate['SK']}")

            except Exception as e:
                print(f"Error updating aggregate {aggregate['SK']}: {e}")




    except Exception as e:
        print(f"Error calculating or saving aggregates: {e}")

    return {
        'statusCode': 200,
        'body': json.dumps('Processing complete with updated aggregates!')
    }
