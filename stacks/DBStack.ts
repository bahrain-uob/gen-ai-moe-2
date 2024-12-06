import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Bucket, Table, StackContext, Function, RDS } from 'sst/constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';
import { Fn, RemovalPolicy, listMapper } from 'aws-cdk-lib';
import AWS from 'aws-sdk';

export function DBStack(this: any, { stack }: StackContext) {
  // Create the original DynamoDB table 'Records'

  const graphlambdafunction = new Function(stack, 'GraphLambdaFunction', {
    handler: 'packages/functions/src/sample-python-lambda/graphdatalambda.main',
    runtime: 'python3.11',
    permissions: ['dynamodb'], // Dynamodb access
  });

  const table = new Table(stack, 'Records', {
    fields: {
      PK: 'string',
      SK: 'string',
    },
    primaryIndex: { partitionKey: 'PK', sortKey: 'SK' },
    stream: true,
  });

  table.addConsumers(stack, {
    consumer1: graphlambdafunction,
  });

  // Create the new DynamoDB table 'userdata' with PK as 'username' and SK as 'schoolname'
  const userdataTable = new Table(stack, 'UserData', {
    fields: {
      PK: 'string', // 'username' will be the partition key
      SK: 'string', // 'schoolname' will be the sort key
    },
    primaryIndex: { partitionKey: 'PK', sortKey: 'SK' },
  });

  const uploads_bucket = new Bucket(stack, 'Uploads');
  const Polly_bucket = new Bucket(stack, 'Polly');
  const audiobucket = new Bucket(stack, 'listeningAudios');
  const speakingPollyBucket = s3.Bucket.fromBucketAttributes(
    this,
    'speakingPolly',
    {
      bucketArn: 'arn:aws:s3:::speaking-questions-polly',
    },
  );

  const feedback_table = new Table(stack, 'ResponseFeedback', {
    fields: {
      feedbackId: 'string',
    },
    primaryIndex: { partitionKey: 'feedbackId' },
  });
  
  const cefrQuestionsTable = new Table(stack, 'CEFRQuestions', {
    fields: {
      PK: 'string',
      SK: 'string',
    },
    primaryIndex: { partitionKey: 'PK', sortKey: 'SK' },
  });

  stack.addOutputs({
    CEFRQuestionsTableName: cefrQuestionsTable.tableName,
  });

  // Create an RDS database
  const mainDBLogicalName = 'MainDatabase';
  // Define output/export attributes names
  const dbSecretArnOutputName = 'DBSecretArn';
  const dbClusterIdentifierOutputName = 'DBClusterIdentifier';
  // create db variable that will hold the RDS db construct
  var db: RDS;

  // if (app.stage == 'prod') {
  //   db = new RDS(stack, mainDBLogicalName, {
  //     engine: 'mysql5.7',
  //     defaultDatabaseName: 'maindb',
  //     migrations: ['.', 'packages', 'db-migrations'].join(path.sep),
  //   });

  //   // Export db secret arn and cluster identifier to be used by other stages
  //   stack.addOutputs({
  //     [dbSecretArnOutputName]: {
  //       value: db.secretArn,
  //       exportName: dbSecretArnOutputName,
  //     },
  //     [dbClusterIdentifierOutputName]: {
  //       value: db.clusterIdentifier,
  //       exportName: dbClusterIdentifierOutputName,
  //     },
  //   });
  // } else {
  //   // Import the existing secret from the exported value
  //   const existing_secret = secretsManager.Secret.fromSecretCompleteArn(
  //     stack,
  //     'ExistingSecret',
  //     Fn.importValue(dbSecretArnOutputName),
  //   );
  //   // Create an SST resource for the existing DB (does not create a new DB, references the existing one)
  //   db = new RDS(stack, 'ExistingDatabase', {
  //     engine: 'mysql5.7',
  //     defaultDatabaseName: 'maindb',
  //     migrations: ['.', 'packages', 'db-migrations'].join(path.sep),
  //     cdk: {
  //       cluster: rds.ServerlessCluster.fromServerlessClusterAttributes(
  //         stack,
  //         'ExistingCluster',
  //         {
  //           // Import the existing cluster identifier from the exported value
  //           clusterIdentifier: Fn.importValue(dbClusterIdentifierOutputName),
  //           secret: existing_secret,
  //         },
  //       ),
  //       secret: existing_secret,
  //     },
  //   });
  // }

  // Output database name
  stack.addOutputs({
    UserDataTableName: userdataTable.tableName,
  });

  // Return relevant resources
  return {
    table,
    userdataTable, // Return the new 'userdata' table as well
    cefrQuestionsTable,
    uploads_bucket,
    feedback_table,
    Polly_bucket,
    speakingPollyBucket,
    audiobucket,
    graphlambdafunction,
  };
}
