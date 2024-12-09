import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB();
const tableName = process.env.tableName || 'unknown_table';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    // Scan the entire table (no PK filter) to retrieve all items
    const response = await dynamodb
      .scan({
        TableName: tableName,
      })
      .promise();

    // Extract the items from the response
    const items = response.Items || [];

    // Create a Set to store unique school names (from SK)
    const schoolsSet = new Set<string>();

    // Iterate through the items and add the SK values (school names) to the Set
    items.forEach(item => {
      const school = item.SK?.S;
      if (school) {
        schoolsSet.add(school);
      }
    });

    // Convert the Set back into an array for response
    const schoolsList = Array.from(schoolsSet);

    // If no schools are found
    if (schoolsList.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No schools found' }),
      };
    }

    // Return the list of unique schools
    return {
      statusCode: 200,
      body: JSON.stringify({
        schools: schoolsList,
      }),
    };
  } catch (error) {
    console.error('Error fetching schools:', error);

    // Return an error message if there's an issue
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch schools' }),
    };
  }
};
