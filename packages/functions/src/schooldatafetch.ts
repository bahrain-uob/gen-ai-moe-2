import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB();
const tableName = process.env.tableName || 'unknown_table';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    // Query DynamoDB for items where PK = 'AGGREGATES' and SK = 'Manama School'
    const response = await dynamodb
      .query({
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': { S: 'AGGREGATES' },
          ':sk': { S: 'Manama School' },
        },
      })
      .promise();

    // Extract the items from the response
    const aggregates = response.Items || [];

    // Ensure we have one and only one matching record
    if (aggregates.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No data found for Manama School' }),
      };
    }
    const aggregateData = aggregates[0];

    // Safely parse and extract the values from the retrieved data
    const parseNumber = (key: string): number => {
      return aggregateData[key]?.N ? +aggregateData[key].N : 0;
    };

    // Fetch aggregate values
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
        school: 'Manama School',
        student_count: studentCount,
        avg_overall_avg: avgOverallAvg,
        avg_reading_score: avgReadingScore,
        avg_listening_score: avgListeningScore,
        avg_speaking_score: avgSpeakingScore,
        avg_writing_score: avgWritingScore,
      }),
    };
  } catch (error) {
    console.error('Error fetching aggregates:', error);

    // Return an error message if there's an issue
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch aggregates' }),
    };
  }
};
