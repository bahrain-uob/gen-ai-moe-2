
import boto3
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
# Define the Records table
records_table = dynamodb.Table('asareer-codecatalyst-sst-app-Records')

# Scan the Records table for all items related to student scores
try:
    # Scan the table to get all student data
    response = records_table.scan()
    all_student_data = response.get('Items', [])

    # Group student records by school (using the sort key `SK` as `school_name`)
    grouped_data = {}
    for record in all_student_data:
        school_name = record.get('SK')  # SK is the sort key and corresponds to 'school_name'
        if school_name:
            if school_name not in grouped_data:
                grouped_data[school_name] = []
            grouped_data[school_name].append(record)

    # Iterate over each group and calculate aggregates
    for school_name, student_records in grouped_data.items():
        # Skip specific SK values (aggregates for overall averages, etc.)
        if school_name in {
            "avg_overall_avg",
            "student_count",
            "avg_reading_score",
            "avg_listening_score",
            "avg_writing_score",
            "avg_speaking_score"
        }:
            print(f"Skipping school aggregate with SK: {school_name}")
            continue  # Skip this iteration

        total_reading_scores = Decimal(0)
        total_listening_scores = Decimal(0)
        total_speaking_scores = Decimal(0)
        total_writing_scores = Decimal(0)
        total_overall_scores = Decimal(0)
        total_students = len(student_records)

        for student_record in student_records:
            total_reading_scores += Decimal(student_record.get('readingbandscore', 0))
            total_listening_scores += Decimal(student_record.get('Listeningbandscore', 0))
            total_speaking_scores += Decimal(student_record.get('speakingbandscore', 0))
            total_writing_scores += Decimal(student_record.get('writingbandscore', 0))
            total_overall_scores += Decimal(student_record.get('overallavg', 0))

        # Calculate averages for the school
        average_reading_score = total_reading_scores / total_students if total_students > 0 else Decimal(0)
        average_listening_score = total_listening_scores / total_students if total_students > 0 else Decimal(0)
        average_speaking_score = total_speaking_scores / total_students if total_students > 0 else Decimal(0)
        average_writing_score = total_writing_scores / total_students if total_students > 0 else Decimal(0)
        average_overall_score = total_overall_scores / total_students if total_students > 0 else Decimal(0)

        # Prepare the aggregates for this school
        school_aggregate_data = {
            'PK': 'AGGREGATES',
            'SK': school_name,
            'avg_reading_score': average_reading_score,
            'avg_listening_score': average_listening_score,
            'avg_speaking_score': average_speaking_score,
            'avg_writing_score': average_writing_score,
            'avg_overall_avg': average_overall_score,
            'student_count': Decimal(total_students),
            'students': [student.get('PK') for student in student_records]  # List of student IDs (assuming PK exists)
        }

        # Update Records table with school aggregates
        try:
            records_table.put_item(Item=school_aggregate_data)
            print(f"Updated aggregate for {school_name}: {school_aggregate_data}")
        except Exception as e:
            print(f"Error updating aggregate for {school_name}: {e}")
    
except Exception as e:
    print(f"Error scanning the Records table: {e}")
