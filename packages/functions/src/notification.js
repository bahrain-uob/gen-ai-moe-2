
export async function main(event) {
    console.log("S3 Event Received:", JSON.stringify(event, null, 2));
  
    // Process each record in the event
    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const objectKey = record.s3.object.key;
  
      console.log(`New object created: ${objectKey} in bucket: ${bucketName}`);
    }
  
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "S3 event processed successfully!" }),
    };
  }

  