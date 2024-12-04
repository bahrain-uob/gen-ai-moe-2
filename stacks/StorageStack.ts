import { Bucket, Function, StackContext } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  // Create the Lambda function
  const notificationFunction = new Function(stack, "NotificationFunctionPY", {
    handler: "packages/functions/src/TextNotification.main",
    timeout: 900,
    runtime: "python3.9", 
    permissions: ["textract:AmazonTextractFullAccesss","s3:GetObject" ,"textract:StartDocumentAnalysis", "textract:GetDocumentAnalysis"],
  });

  // Create the S3 bucket and set up notifications
  const bucket = new Bucket(stack, "Bucket", {
    notifications: {
      myNotification: {
        function: notificationFunction,
        events: ["object_created"], 
      },
    },
  });
  // Outputs
  stack.addOutputs({
    BucketName: bucket.bucketName,
    LambdaFunctionName: notificationFunction.functionName,
  });

  return { bucket , notificationFunction};
}
