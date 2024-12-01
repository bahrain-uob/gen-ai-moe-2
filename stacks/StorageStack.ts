import { Bucket, Function, StackContext } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  // Create the Lambda function
  const notificationFunction = new Function(stack, "NotificationFunction", {
    handler: "packages/functions/src/notification.main",
  });

  // Create the S3 bucket and set up notifications
  const bucket = new Bucket(stack, "Bucket", {
    notifications: {
      myNotification: {
        function: notificationFunction,
        events: ["object_created"], // Trigger on object creation
      },
    },
  });

  // Outputs
  stack.addOutputs({
    BucketName: bucket.bucketName,
    LambdaFunctionName: notificationFunction.functionName,
  });

  return { bucket };
}
