import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Bucket } from 'sst/node/bucket';
import { use } from 'sst/constructs';
import { DBStack } from '../../../stacks/DBStack';

const s3 = new S3Client({});

export const handler: APIGatewayProxyHandler = async event => {
  //const bucketName = Bucket.Polly.bucketName;
  // const {
  //   speakingPollyBucket
  // } = use(DBStack);
  
  const bucketName = Bucket.speakingPolly.bucketName;
  
  if (!event.body || !event.headers['content-type']) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'File data or Content-Type is missing.',
      }),
    };
  }
  console.log(event.body);

  const contentType = event.headers['content-type'];
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/); // Improved boundary matching
  if (!boundaryMatch) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid Content-Type: boundary not found.',
      }),
    };
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const bodyBuffer = Buffer.from(event.body, 'base64');
  const bodyText = bodyBuffer.toString('binary');

  // Correct splitting: include the closing boundary and handle potential extra whitespace
  const parts = bodyText
    .split(`--${boundary}`)
    .filter(
      part =>
        part.trim() !== '' && part.trim() !== '--' && !part.startsWith('--'),
    );

  const uploadedFiles: string[] = [];
  let fileCounter = 1;

  for (const part of parts) {
    const headersEndIndex = part.indexOf('\r\n\r\n');
    if (headersEndIndex === -1) continue;

    const headers = part.slice(0, headersEndIndex);
    const rawBody = part.slice(headersEndIndex + 4); // No trim here, important for binary data

    const dispositionMatch = headers.match(
      /Content-Disposition:.*filename="(.+?)"/,
    );
    if (!dispositionMatch) {
      console.log('Skipped part without filename.');
      continue;
    }

    const filename = dispositionMatch[1];

    const contentTypeMatch = headers.match(/Content-Type: (.+)/);
    const contentTypeHeader = contentTypeMatch ? contentTypeMatch[1] : null;

    if (!contentTypeHeader) {
      console.log('Skipped part without Content-Type.');
      continue;
    }

    const fileData = Buffer.from(rawBody, 'binary');

    try {
      const userID =
        event.requestContext.authorizer?.jwt.claims.sub || 'anonymous';
      const currentSection = event.queryStringParameters?.section || 'default';
      const fileName = `unApproved/${currentSection}/${userID}-FILENUM-${fileCounter}.${contentTypeHeader.split('/')[1] || 'bin'}`;
      fileCounter++; // Increment for the next file

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileData,
        ContentType: contentTypeHeader,
        Metadata: {
          // Example of adding metadata
          originalFilename: filename,
        },
      });

      await s3.send(command);
      uploadedFiles.push(fileName);
    } catch (error) {
      console.error(`Error uploading file ${filename}:`, error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message:
        uploadedFiles.length > 0
          ? 'Files uploaded successfully!'
          : 'No valid files were uploaded.',
      files: uploadedFiles,
    }),
  };
};
