// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { APIGatewayProxyHandler } from 'aws-lambda';
// import { Bucket } from 'sst/node/bucket';
// // import { v4 as uuidv4 } from 'uuid'; // To generate a unique file name

// const s3 = new S3Client({});

// export const handler: APIGatewayProxyHandler = async event => {
//   //const bucketName = 'hsn-codecatalyst-sst-app--buckettextractbucket4e81-9qp7bptepiwk';
//   const bucketName = Bucket.BucketTextract.bucketName;
//   console.log(bucketName);

//   // Check if the body of the request exists
//   if (!event.body) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ message: 'File data is required' }),
//     };
//   }

//   // Check if the Content-Type header is present
//   const contentType: string | undefined = event.headers['content-type'];
//   console.log(event.headers);

//   // Ensure contentType is not undefined and is one of the allowed types
//   if (!contentType) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ message: 'Content-Type header is missing' }),
//     };
//   }

//   // Generate a unique file name using UUID
//   const userID = event.requestContext.authorizer!.jwt.claims.sub;
//   const fileName = `${userID}.${
//     contentType === 'image/jpeg'
//       ? 'jpeg'
//       : contentType === 'image/png'
//       ? 'png'
//       : 'unknown'
//   }`;

//   if (fileName.endsWith('unknown')) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({
//         message: 'Invalid Content-Type. Only JPEG and PNG are supported.',
//       }),
//     };
//   }

//   try {
//     const fileData = Buffer.from(event.body, 'base64'); // Decode base64 image data
//     const command = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: fileName,
//       Body: fileData,
//       ContentType: contentType, // Dynamic based on input header
//     });

//     await s3.send(command);
//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: `Uploaded Successfully!`,
//       }),
//     };
//   } catch (error) {
//     console.error('Failed to upload file: ', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: 'Failed to upload file' }),
//     };
//   }
// };
import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Bucket } from 'sst/node/bucket';
import { S3 } from 'aws-sdk';
import { use } from 'sst/constructs';
import { DBStack } from '../../../stacks/DBStack';

const s3 = new S3Client({});
const s3list = new S3();

export const handler: APIGatewayProxyHandler = async event => {
  //const bucketName = Bucket.Polly.bucketName;
  // const {
  //   speakingPollyBucket
  // } = use(DBStack);
  
  const bucketName = Bucket.speakingPolly.bucketName;

  if (!event.body || !event.headers['content-type']) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'File data or Content-Type is missing.' }),
    };
  }

  const contentType = event.headers['content-type'];
  const boundaryMatch = contentType.match(/boundary=(.+)/);
  const boundary = boundaryMatch ? boundaryMatch[1] : null;

  if (!boundary) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid Content-Type: boundary not found.' }),
    };
  }

  // Decode the body
  const bodyBuffer = Buffer.from(event.body, 'base64'); // AWS Lambda encodes body in base64
  const bodyText = bodyBuffer.toString('binary'); // Convert to binary string
  const parts = bodyText.split(`--${boundary}`).filter(part => part.trim() !== '' && part.trim() !== '--');

  let fileData: Buffer | undefined;
  let contentTypeHeader: string | undefined;

  parts.forEach(part => {
    const [headers, rawBody] = part.split('\r\n\r\n');
    if (!headers || !rawBody) return;

    // Extract Content-Type if available
    const contentTypeMatch = headers.match(/Content-Type: (.+)/);
    if (contentTypeMatch) {
      contentTypeHeader = contentTypeMatch[1];
    }

    // If no Content-Disposition exists, assume this is the file if Content-Type is present
    if (contentTypeHeader) {
      fileData = Buffer.from(rawBody.trim(), 'binary');
    }
  });

  if (!fileData || !contentTypeHeader) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Failed to parse file data.' }),
    };
  }

  try {
    const userID = event.requestContext.authorizer!.jwt.claims.sub;
    const currentSection = event.queryStringParameters?.section || 'default';

    // List all objects in the S3 bucket
    const objects = await s3list.listObjectsV2({ Bucket: bucketName, Prefix: `unApproved/${currentSection}/`, }).promise();

    console.log("LIST COMMAND:", objects)
    let targetObjectKey: string | null = null;

    // Find the object whose name contains the userID
    for (const obj of objects.Contents || []) {
      if (obj.Key && obj.Key.includes(userID)) {
        targetObjectKey = obj.Key;
        console.log("Obj Key COMMAND:", obj.Key)
      }
    }

    const fileName = `unApproved/${currentSection}/${userID}.${contentTypeHeader.split('/')[1] || 'bin'}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileData,
      ContentType: contentTypeHeader,
    });

    await s3.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully!', fileName }),
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to upload file' }),
    };
  }
};
