import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB();
const tableName = process.env.tableName || 'unknown_table';

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        // Query DynamoDB for items where PK = 'aggregates'
        const response = await dynamodb.query({
            TableName: tableName,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': { S: 'aggregates' },
            },
        }).promise();

        // Extract the items from the response
        const aggregates = response.Items || [];

        // Find student_count item
        const studentCountItem = aggregates.find(item => item.SK.S === 'student_count');
        const studentCount = studentCountItem && studentCountItem.value.N ? parseInt(studentCountItem.value.N, 10) : 0;

        // Find avg_overall_avg item (if exists)
        const avgOverallAvgItem = aggregates.find(item => item.SK.S === 'avg_overall_avg');
        const avgOverallAvg = avgOverallAvgItem && avgOverallAvgItem.value.N ? parseFloat(avgOverallAvgItem.value.N) : 0.0;

        // Return the result with CORS headers
        return {
            statusCode: 200,
            body: JSON.stringify({ student_count: studentCount, avg_overall_avg: avgOverallAvg }),
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