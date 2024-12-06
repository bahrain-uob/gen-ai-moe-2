import boto3
import time

def main(event, context):
    print("Lambda is Triggered NOW in the safe mode :) ")
    '''
    try:
        print(f"Received event: {event}")
        fileObj = event["Records"][0]
        bucketName = fileObj["s3"]["bucket"]["name"]
        fileName = fileObj["s3"]["object"]["key"]
        print(f"Bucket: {bucketName}, File: {fileName}")

        # Check if the uploaded file is a PDF
        if fileName.lower().endswith('.pdf'):
            textractClient = boto3.client('textract')
            response = textractClient.start_document_analysis(
                DocumentLocation={'S3Object': {'Bucket': bucketName, 'Name': fileName}},
                FeatureTypes=['FORMS']
            )
            jobId = response['JobId']
            print(f"Started document analysis with JobId: {jobId}")

            # Poll for job completion
            while True:
                jobResponse = textractClient.get_document_analysis(JobId=jobId)
                jobStatus = jobResponse['JobStatus']
                if jobStatus in ['SUCCEEDED', 'FAILED']:
                    break
                print(f"Job Status: {jobStatus}. Waiting for completion...")
                time.sleep(5)  # Wait for 5 seconds before checking again

            # Check if the job succeeded and print the result
            if jobStatus == 'SUCCEEDED':
                print("Document analysis succeeded!")
                print(jobResponse)
                print("Extracted Text Lines:")
                for block in jobResponse['Blocks']:
                    if block['BlockType'] == 'LINE':  # Only process lines of text
                        print(block['Text'])
            else:
                print("Document analysis failed!")
        else:
            print("Please upload a PDF file")
    except Exception as e:
        print(f"Error: {str(e)}")
    '''
