import { Bucket, Function, StackContext } from 'sst/constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { CfnBucket } from 'aws-cdk-lib/aws-s3'

export function StorageStack({ stack }: StackContext) {
  //Create the Lambda function
  const notificationFunction = new Function(stack, 'NotificationFunctionPY', {
    handler:
      'packages/functions/src/extractFunction.handler',
    timeout: 900,
    //runtime: "python3.9", 
    permissions: ["textract:AmazonTextractFullAccesss","s3:GetObject" ,"textract:StartDocumentAnalysis", "textract:GetDocumentAnalysis" ,"s3:PutObject"],
  });

  // Create the S3 bucket and set up notifications
  const bucket = new Bucket(stack, 'BucketTextract', {
    //blockPublicACLs: true,
    notifications: {
      myNotification: {
        function: notificationFunction,
        events: ['object_created'],
      },
    },
    cdk:{
      bucket:{
        publicReadAccess: false,
        // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      }
    }
  });

  const bucket2 = new Bucket(stack, "ExtractedTXT",{
    //blockPublicACLs: true,
    cdk:{
      bucket:{
        publicReadAccess: false,
        // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      }
    }
  });
  notificationFunction.bind([bucket2]);
  // Outputs
  stack.addOutputs({
    BucketName: bucket.bucketName,
    LambdaFunctionName: notificationFunction.functionName,
  });

  return { bucket , notificationFunction , bucket2};
}
