// let's try change anything!
// second change!
// third change
// please study broooooo
// more changes
import {
  Api,
  StackContext,
  use,
  WebSocketApi,
  Function,
  Cron,
  toCdkDuration,
} from 'sst/constructs';
import { DBStack } from './DBStack';
import { CacheHeaderBehavior, CachePolicy } from 'aws-cdk-lib/aws-cloudfront';
import { AuthStack } from './AuthStack';
import { GrammarToolStack } from './GrammarToolStack';
import { StorageStack } from './StorageStack';
import { Duration } from 'aws-cdk-lib';

export function ApiStack({ stack }: StackContext) {
  const {
    table,
    cefrQuestionsTable,
    uploads_bucket,
    feedback_table,
    speakingPollyBucket,
    Polly_bucket,
    audiobucket,
    userdataTable,
  } = use(DBStack);
  const { bucket, bucket2 } = use(StorageStack);
  const { auth } = use(AuthStack);
  const { grammarToolDNS } = use(GrammarToolStack);

  // Create the HTTP API
  const api = new Api(stack, 'Api', {
    defaults: {
      authorizer: 'jwt',
      function: {
        // Bind the table name to our API
        bind: [table, speakingPollyBucket, bucket, bucket2],
      },
    },
    authorizers: {
      jwt: {
        type: 'user_pool',
        userPool: {
          id: auth.userPoolId,
          clientIds: [auth.userPoolClientId],
        },
      },
    },
    routes: {
      // Sample TypeScript lambda function
      'POST /': 'packages/functions/src/lambda.main',
      // Function that returns a random question
      'GET /question/{questionType}': 'packages/functions/src/question.main',
      //example for using the language tool service
      'GET /languageTool': {
        function: {
          handler: 'packages/functions/src/languageTool.main',
          environment: {
            grammerToolDNS: grammarToolDNS,
          },
        },
      },
      // Speaking getting a presigned URL to upload the response
      'POST /generate-presigned-url': {
        function: {
          handler: 'packages/functions/src/generatePresignedUrl.main',
          permissions: ['s3:PutObject'],
          environment: {
            audioResponseBucket: uploads_bucket.bucketName,
          },
        },
      },
      // Speaking getting the polly audio
      'GET /speakingRecording/{key}': {
        function: {
          handler: 'packages/functions/src/speakingRecording.main',
          permissions: ['s3:GetObject'],
          environment: {
            speakingPollyBucket: speakingPollyBucket.bucketName,
          },
        },
      },
      // Speaking grading lambda function
      'POST /speaking': {
        function: {
          handler: 'packages/functions/src/speaking.main',
          permissions: [
            's3:GetObject',
            's3:PutObject',
            'transcribe:StartTranscriptionJob',
            'transcribe:GetTranscriptionJob',
            'bedrock:InvokeModel',
            'dynamodb:PutItem',
          ],
          environment: {
            speakingUploadBucketName: uploads_bucket.bucketName,
            feedbackTableName: feedback_table.tableName,
          },
          timeout: '120 seconds',
        },
      },
      'POST /putCEFRQuestions': {
        function: {
          handler: 'packages/functions/src/putCEFRQuestions.handler',
          permissions: ['dynamodb:PutItem'],
          environment: {
            cefrQuestionsTableName: cefrQuestionsTable.tableName,
          },
          timeout: '120 seconds',
        },
      },

      // Listening to convert script to audio (for now)
      'POST /Listening/AddQuestion': {
        function: {
          handler:
            'packages/functions/src/sample-python-lambda/addListeningQ.main',
          runtime: 'python3.11',
          permissions: ['s3:*', 'polly:SynthesizeSpeech', 'dynamodb:PutItem'],
          timeout: '60 seconds',
          environment: { Polly_Bucket: Polly_bucket.bucketName },
        },
      },
      'GET /startTest/{testType}': 'packages/functions/src/startTest.main',
      'GET /Listening/audio': {
        function: {
          handler:
            'packages/functions/src/sample-python-lambda/getListeningAudio.main',
          runtime: 'python3.11',
          permissions: ['s3:*'],
          timeout: '60 seconds',
          environment: { audioBucket: audiobucket.bucketName },
        },
      },
      'GET /getAggregates': {
        function: {
          handler: 'packages/functions/src/getAggregates.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: table.tableName,
          },
        },
      },
      'GET /streaksgraphoverall': {
        function: {
          handler: 'packages/functions/src/streaksgraphoverall.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: table.tableName,
            tableName2: userdataTable.tableName,

          },
        },
      },
      'GET /correlation': {
        function: {
          handler: 'packages/functions/src/correlation.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: userdataTable.tableName,
          },
        },
      },
      'GET /studentperformance': {
        function: {
          handler: 'packages/functions/src/studentperformance.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: userdataTable.tableName,
            tableName2: table.tableName,
          },
        },
      },
      'GET /schooltopachievers': {
        function: {
          handler: 'packages/functions/src/schooltopachievers.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: userdataTable.tableName,
            tableName2: table.tableName,
          },
        },
      },

      'GET /schoolsstudenttable': {
        function: {
          handler: 'packages/functions/src/fetchtheschoolsstudentdata.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: userdataTable.tableName,
          },
        },
      },
      'GET /homeuser': {
        function: {
          handler: 'packages/functions/src/homeuser.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: userdataTable.tableName,
            tableName2: table.tableName,
          },
        },
      },

      'GET /schooldatafetch': {
        function: {
          handler: 'packages/functions/src/schooldatafetch.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: table.tableName,
          },
        },
      },

      'GET /listofschools': {
        function: {
          handler: 'packages/functions/src/listofschools.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: userdataTable.tableName,
          },
        },
      },
      'GET /secondgraph': {
        function: {
          handler: 'packages/functions/src/adminsecondgraph.handler',
          permissions: ['dynamodb:*'],
          timeout: '60 seconds',
          environment: {
            tableName: table.tableName,
          },
        },
      },

      // get the test item when graded
      'GET /fullTestFeedback/{SK}':
        'packages/functions/src/getFullTestFeedback.main',

      // get the list of previous tests
      'GET /previousTest': 'packages/functions/src/getPreviousTests.main',

      'POST /createUserLevel': {
        function: {
          handler: 'packages/functions/src/streaks/createUserLevel.handler',
          permissions: ['dynamodb:PutItem'],
          timeout: '120 seconds',
        },
      },
      'POST /incrementStreaks': {
        function: {
          handler:
            'packages/functions/src/streaks/incrementUserStreaks.handler',
          permissions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'ses:SendEmail'],
          timeout: '120 seconds',
          environment: {
            s3Bucket: uploads_bucket.bucketName,
          },
        },
      },
      'GET /getUserLevel': {
        function: {
          handler: 'packages/functions/src/streaks/getUserLevel.handler',
          permissions: ['dynamodb:GetItem'],
          timeout: '120 seconds',
        },
      },
      'GET /getQuestionsByLevel': {
        function: {
          handler: 'packages/functions/src/streaks/getQuestionsByLevel.handler',
          permissions: ['dynamodb:Query'],
          timeout: '120 seconds',
          environment: {
            cefrQuestionsTableName: cefrQuestionsTable.tableName,
          },
        },
      },
      'POST /fileUpload': {
        function: {
          handler: 'packages/functions/src/s3adminUpload.handler',
          permissions: ['s3:PutObject', 's3:PutObjectAcl'],
          environment: {
            bucket: bucket.bucketName,
          },
          timeout: '120 seconds',
        },
      },
      'POST /UploadAudio': {
        function: {
          handler: 'packages/functions/src/s3adminUploadAudio.handler',
          permissions: ['s3:PutObject', 's3:PutObjectAcl'],
          environment: {
            speakingPollyBucket: speakingPollyBucket.bucketName,
            bucket: bucket.bucketName,
          },
          timeout: '120 seconds',
        },
      },
      'POST /UploadImage': {
        function: {
          handler: 'packages/functions/src/s3adminUploadImage.handler',
          permissions: ['s3:PutObject', 's3:PutObjectAcl'],
          environment: {
            speakingPollyBucket: speakingPollyBucket.bucketName,
            bucket: bucket.bucketName,
          },
          timeout: '120 seconds',
        },
      },
      'GET /getExtract': {
        function: {
          handler: 'packages/functions/src/getTXT.handler',
          permissions: ['s3:ListBucket', 's3:GetObject', 'bedrock:InvokeModel'],
          timeout: '120 seconds',
        },
      },
      'GET /getExtractReading': {
        function: {
          handler: 'packages/functions/src/getTXTReading.handler',
          permissions: ['s3:ListBucket', 's3:GetObject', 'bedrock:InvokeModel'],
          timeout: '120 seconds',
        },
      },
      'GET /getExtractWriting': {
        function: {
          handler: 'packages/functions/src/getTXTWriting.handler',
          permissions: ['s3:ListBucket', 's3:GetObject'],
          timeout: '60 seconds',
        },
      },
      'GET /getExtractSpeaking': {
        function: {
          handler: 'packages/functions/src/getTXTSpeaking.handler',
          permissions: ['s3:ListBucket', 's3:GetObject'],
          timeout: '60 seconds',
        },
      },
      'POST /approveListening': {
        function: {
          handler: 'packages/functions/src/approveListening.handler',
          permissions: ['s3:ListBucket', 's3:GetObject', 's3:DeleteObject','s3:PutObject'],
          environment: {
            speakingPollyBucket: speakingPollyBucket.bucketName,
          },
          timeout: '60 seconds',
        },
      },
      'POST /approveReading': {
        function: {
          handler: 'packages/functions/src/approveReading.handler',
          permissions: ['s3:ListBucket', 's3:GetObject', 's3:DeleteObject'],
          timeout: '60 seconds',
        },
      },
      'POST /approveWriting': {
        function: {
          handler: 'packages/functions/src/approveWriting.handler',
          permissions: ['s3:ListBucket', 's3:GetObject', 's3:DeleteObject', 's3:CopyObject','s3:PutObject'],
          timeout: '60 seconds',
        },
      },
      'POST /approveSpeaking': {
        function: {
          handler: 'packages/functions/src/approveSpeaking.handler',
          permissions: ['s3:ListBucket', 's3:GetObject', 's3:DeleteObject','s3:PutObject'],
          environment: {
            speakingPollyBucket: speakingPollyBucket.bucketName,
          },
          timeout: '60 seconds',
        },
      },
      'GET /getAudioFiles': {
        function: {
          handler:'packages/functions/src/getAudioFiles.handler',
          permissions:['s3:ListBucket','s3:GetObject'],
          environment: {
            speakingPollyBucket: speakingPollyBucket.bucketName,
          },
          timeout: '60 seconds'
        },
      },
    },
  });

  // cache policy to use with cloudfront as reverse proxy to avoid cors
  // https://dev.to/larswww/real-world-serverless-part-3-cloudfront-reverse-proxy-no-cors-cgj
  const apiCachePolicy = new CachePolicy(stack, 'CachePolicy', {
    minTtl: Duration.seconds(0), // no cache by default unless backend decides otherwise
    defaultTtl: Duration.seconds(0),
    headerBehavior: CacheHeaderBehavior.allowList(
      'Accept',
      'Authorization',
      'Content-Type',
      'Referer',
    ),
  });

  const webSocket = new WebSocketApi(stack, 'WebSocketApi', {
    defaults: {
      function: {
        bind: [table, uploads_bucket],
        permissions: [
          'bedrock:InvokeModel',
          's3:GetObject',
          'transcribe:StartTranscriptionJob',
          'transcribe:GetTranscriptionJob',
        ],
        environment: {
          speakingPollyBucket: speakingPollyBucket.bucketName,
          grammerToolDNS: grammarToolDNS,
        },
      },
    },
    authorizer: {
      type: 'lambda',
      identitySource: [`route.request.querystring.idToken`],
      function: new Function(stack, 'Authorizer', {
        handler: 'packages/functions/src/websockets/authorizer.handler',
        environment: {
          userPool: auth.userPoolId,
          userPoolClient: auth.userPoolClientId,
        },
      }),
    },
    routes: {
      $connect: 'packages/functions/src/websockets/connect.main',
      $disconnect: 'packages/functions/src/websockets/disconnect.main',
      fullTestStart: {
        function: {
          handler: 'packages/functions/src/websockets/fullTest/start.main',
        },
      },
      fullTestAutoSave: {
        function: {
          handler: 'packages/functions/src/websockets/fullTest/autoSave.main',
          timeout: '120 seconds',
        },
      },
      fullTestGetQuestion: {
        function: {
          handler:
            'packages/functions/src/websockets/fullTest/getQuestion.main',
          timeout: '120 seconds',
        },
      },
      fullTestSubmit: {
        function: {
          handler: 'packages/functions/src/websockets/fullTest/submit.main',
          timeout: '120 seconds',
        },
      },
      sectionTestStart: {
        function: {
          handler: 'packages/functions/src/websockets/sectionTest/start.main',
        },
      },
      sectionTestAutoSave: {
        function: {
          handler:
            'packages/functions/src/websockets/sectionTest/autoSave.main',
          timeout: '120 seconds',
        },
      },
      sectionTestGetQuestion: {
        function: {
          handler:
            'packages/functions/src/websockets/sectionTest/getQuestion.main',
          timeout: '120 seconds',
        },
      },
      sectionTestSubmit: {
        function: {
          handler: 'packages/functions/src/websockets/sectionTest/submit.main',
          timeout: '120 seconds',
        },
      },
      gradeSpeakingP1: {
        function: {
          handler: 'packages/functions/src/speakingP1Grading.main',
          permissions: [
            's3:GetObject',
            's3:PutObject',
            'transcribe:StartTranscriptionJob',
            'transcribe:GetTranscriptionJob',
            'dynamodb:PutItem',
          ],
          environment: {
            speakingUploadBucketName: uploads_bucket.bucketName,
            feedbackTableName: feedback_table.tableName,
          },
          timeout: '120 seconds',
        },
      },
      gradeSpeakingP2: {
        function: {
          handler: 'packages/functions/src/speakingP2Grading.main',
          permissions: [
            's3:GetObject',
            's3:PutObject',
            'transcribe:StartTranscriptionJob',
            'transcribe:GetTranscriptionJob',
            'dynamodb:PutItem',
          ],
          environment: {
            speakingUploadBucketName: uploads_bucket.bucketName,
            feedbackTableName: feedback_table.tableName,
          },
          timeout: '120 seconds',
        },
      },
    },
  });

  const resetStreaksCron = new Cron(stack, 'DailyResetStreaksCron', {
    schedule: 'cron(0 0 * * ? *)', // Runs daily at midnight UTC
    job: {
      function: {
        handler: 'packages/functions/src/streaks/resetStreaks.handler',
        permissions: ['dynamodb:Scan', 'dynamodb:UpdateItem'],
        timeout: '120 seconds',
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    WebSocketEndpoint: webSocket.url,
  });

  // Allowing authenticated users to access API
  auth.attachPermissionsForAuthUsers(stack, [api, webSocket]);

  return { api, apiCachePolicy, webSocket };
}

// last change pull request!