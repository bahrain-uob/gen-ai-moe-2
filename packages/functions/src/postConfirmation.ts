import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { Table } from 'sst/node/table';

/**
 * This function is called after a user has been confirmed to initialize the
 * user in the database
 *
 * See https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-confirmation.html
 */
const handler: PostConfirmationTriggerHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Received context:', JSON.stringify(context));
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    // Add the user to the institution students list

    //TODO: Handle the case of DB error

    const client = new DynamoDBClient();
    const dynamoDb = DynamoDBDocumentClient.from(client);

    // Update institution students list
    const updateCommand = new UpdateCommand({
      TableName: Table.Records.tableName,
      Key: {
        PK: 'AGGREGATES',
        SK: event.request.userAttributes['custom:Institution'],
      },
      // if students record does not exist, create it and add user ID to the list
      UpdateExpression:
        'SET students = list_append(if_not_exists(students, :init), :ID)',
      ExpressionAttributeValues: {
        ':init': [],
        ':ID': [event.userName],
      },
      ReturnValues: 'NONE',
    });

    const updateResponse = await dynamoDb.send(updateCommand);
    console.log('Update Response:', updateResponse);

    
    // Initialize Scores in UserData DB
    let instituteSortKey = "Failed to get Institute"
    if(event.request.userAttributes['custom:Institution']) // This will always be true
      instituteSortKey = event.request.userAttributes['custom:Institution']

    const putUserCommand = new PutCommand({
      TableName: Table.UserData.tableName,
      Item: {
        PK: event.userName,
        SK: instituteSortKey,
        Listeningbandscore: 0,
        overallavg: 0,
        readingbandscore: 0,
        speakingbandscore: 0,
        writingbandscore: 0,
      },
      ConditionExpression:
        'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    });

    try {
      const putResponse = await dynamoDb.send(putUserCommand);
      console.log('Put Response:', putResponse);
    } catch (error) {
      console.error('Error adding new student record:', error);
    }

    // Initialize Aggregates Scores in Records DB
    // This command will only run once ever for the first sign-Up ever, TODO: Move it somewhere so it will be run only once ever
    const putAvgCommand = new PutCommand({
      TableName: Table.Records.tableName,
      Item: {
        PK: 'AGGREGATES',
        SK: 'TOTALS',
        Avg_overall_avg: 0,
        student_count: 0,
        avg_reading_score: 0,
        avg_listening_score: 0,
        avg_writing_score: 0,
        avg_speaking_score: 0,
      },
      ConditionExpression:
        'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    });

    try {
      const putResponse = await dynamoDb.send(putAvgCommand);
      console.log('Put Response:', putResponse);
    } catch (error) {
      console.error('Error adding new student record:', error);
    }
  

    // Add new record for the student plan
    // const putCommand = new PutCommand({
    //   TableName: Table.Records.tableName,
    //   Item: {
    //     PK: event.userName,
    //     SK: 'plan',
    //   },
    //   ConditionExpression:
    //     'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    // });

    // try {
    //   const putResponse = await dynamoDb.send(putCommand);
    //   console.log('Put Response:', putResponse);
    // } catch (error) {
    //   console.error('Error adding new student record:', error);
    // } I commented this out because we dont have a study plan anymore
  }

  return event;
};

export { handler };
