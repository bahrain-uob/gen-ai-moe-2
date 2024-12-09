import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB();
const tableName = process.env.tableName || 'unknown_table'; // DynamoDB table name

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    // Extract query parameters from the event
    const { queryStringParameters } = event;
    const school = queryStringParameters?.school; // Fetch school name from query parameters

    // Ensure the 'school' parameter is provided
    if (!school) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'School parameter (school) is required' }),
      };
    }

    // Query DynamoDB for items where PK = 'AGGREGATES' and SK = the provided school
    const response = await dynamodb
      .query({
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': { S: 'AGGREGATES' },
          ':sk': { S: school },
        },
      })
      .promise();

    // Extract the items from the response
    const aggregates = response.Items || [];

    // Ensure we have one and only one matching record
    if (aggregates.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `No data found for school: ${school}` }),
      };
    }

    const aggregateData = aggregates[0];

    // Safely parse and extract the values from the retrieved data
    const parseNumber = (key: string): number => {
      // Return 0 if the key is missing or not a valid number
      const value = aggregateData[key]?.N;
      return value ? +value : 0;
    };

    // Fetch aggregate values from the database
    const studentCount = parseNumber('student_count');
    const avgOverallAvg = parseNumber('avg_overall_avg');
    const avgReadingScore = parseNumber('avg_reading_score');
    const avgListeningScore = parseNumber('avg_listening_score');
    const avgSpeakingScore = parseNumber('avg_speaking_score');
    const avgWritingScore = parseNumber('avg_writing_score');

    // Return the result with CORS headers
    return {
      statusCode: 200,
      body: JSON.stringify({
        school,
        student_count: studentCount,
        avg_overall_avg: avgOverallAvg,
        avg_reading_score: avgReadingScore,
        avg_listening_score: avgListeningScore,
        avg_speaking_score: avgSpeakingScore,
        avg_writing_score: avgWritingScore,
      }),
    };
  } catch (error: unknown) {
    // Type assertion to Error type
    const err = error as Error;

    console.error('Error fetching aggregates:', err.message);

    // Enhanced error handling
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Could not fetch aggregates',
        details: err.message,
      }),
    };
  }
};
