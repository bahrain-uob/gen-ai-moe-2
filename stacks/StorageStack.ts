import { Bucket, Function, StackContext } from 'sst/constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { CfnParameter } from 'aws-cdk-lib';
import sstConfig from '../sst.config';
import { EncryptionConfiguration } from 'aws-cdk-lib/aws-stepfunctions';

export function StorageStack({ stack }: StackContext) {
  const applyPublicAccessBlock = new CfnParameter(stack, 'ApplyPublicAccessBlock', {
    type: 'String',
    default: 'true',  // Default to "true" (public access block applied)
    allowedValues: ['true', 'false'],
    description: 'Whether to apply the public access block on the S3 bucket.',
  });

  //Create the Lambda function
  const notificationFunction = new Function(stack, 'NotificationFunctionPY', {
    handler:
      'packages/functions/src/extractFunction.handler',
    timeout: 900,
    //runtime: "python3.9", 
    permissions: ["textract:AmazonTextractFullAccesss","s3:GetObject" ,"textract:StartDocumentAnalysis", "textract:GetDocumentAnalysis" ,"s3:PutObject"],
  });

  // Create the S3 bucket and set up notifications
  // const bucket = new Bucket(stack, 'BucketTextract', {
  //   cdk:{
  //     bucket:{
  //       blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  //     }
  //   },
  //   //blockPublicACLs: true,
  //   notifications: {
  //     myNotification: {
  //       function: notificationFunction,
  //       events: ['object_created'],
  //     },
  //   }
  // });

  const bucket = new CfnBucket(stack, "BucketTextract", {
    notificationConfiguration: {
      lambdaConfigurations: [
        {
          event: "s3:ObjectCreated:Put",
          function: notificationFunction.functionArn,
        },
      ]
    },
  });

  const bucket2 = new CfnBucket(stack, "ExtractedTXT", {
  });

  // notificationFunction.bind([bucket2]);
  notificationFunction.attachPermissions([bucket2]);
  // Outputs
  stack.addOutputs({
    BucketName: bucket.bucketName,
    LambdaFunctionName: notificationFunction.functionName,
  });

  return { bucket , notificationFunction , bucket2};
}
