//const userID = event.requestContext.authorizer!.jwt.claims.sub;
import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
import { v4 as uuidv4 } from 'uuid';
import { Table } from 'sst/node/table';
import * as AWS from 'aws-sdk';
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";

const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("events:" , event.body);
  const sourceBucket = Bucket.speakingPolly.bucketName;
  const destinationBucket = Bucket.speakingPolly.bucketName;
  let listIDs = []
   for (let i = 0; i<7; i++){
            let currentID = uuidv4()
            try{
              const objectData = await s3
                        .getObject({
                        Bucket: sourceBucket,
                        Key: currentID
                        })
                        .promise();
                    console.log("Object retrieved successfully:", objectData);
            
                i--
            }
            catch{
              listIDs.push(currentID)
            }
            
            
            
        
          }
  try {
    let questionID = "";
    let questionID2 = "";
    const dynamodb = new AWS.DynamoDB();
          const tableName = Table.Records.tableName;
          if (!event.body) {
              return { statusCode: 400, body: JSON.stringify({ message: "No body provided in the event" }) };
          }
          console.log("events:" , event.body);
          const parsedBody = JSON.parse(JSON.parse(event.body))
          console.log("DOUBLE PARSE:", parsedBody)

          parsedBody[2] = parsedBody[2].map((url: string) => url.split('/').pop()!);
          const objectNames = parsedBody[2]
          console.log("Files names:", objectNames)

          const firstFiveSentences = parsedBody[0][0]
          .split('.\n') 
          .slice(0, 5); 
        
    
          const transactItems: any[] = [];
          let id = uuidv4();
          let checker = true;
          while(checker) {
            const check = await dynamodb
            .query({
              TableName: tableName,
              KeyConditionExpression: 'PK = :pk AND SK = :sk',
              ExpressionAttributeValues: {
                ':pk': { S: 'speaking' },  // String value for PK
                ':sk': { S: id },   // String value for SK
                },
                ProjectionExpression: 'PK, SK',
            })
            .promise(); 
            const checkQuestion = check.Items?.[0];
            if (checkQuestion) {
              // const sortKey = checkQuestion.SK?.S
              id = uuidv4();
            }
            else {
              checker = false;
            }
           }
           transactItems.push({
            Put: {
                TableName: tableName,
                Item: {
                    PK: { S: "speaking" },
                    SK: { S: id },
                    P1: {
                        M: {
                            Questions: {
                                L: [
                                    {
                                        M: {
                                            S3key: { S: `${listIDs[1]}.${objectNames[1].split('.').pop()}` },
                                            text: { S: `${parsedBody[1][1]}` },
                                        }
                                    },
                                    {
                                        M: {
                                            S3key: { S: `${listIDs[2]}.${objectNames[2].split('.').pop()}` },
                                            text: { S: `${parsedBody[1][2]}` },
                                        }
                                    },
                                    {
                                        M: {
                                            S3key: { S: `${listIDs[3]}.${objectNames[3].split('.').pop()}` },
                                            text: { S: `${parsedBody[1][3]}` },
                                        }
                                    }
                                ]
                            },
                            Task: {
                                M: {
                                    S3key: { S: `${listIDs[0]}.${objectNames[0].split('.').pop()}` },
                                    text: { S: `${parsedBody[1][0]}` },
                                }
                            }
                        }
                    },
                    P2: {
                        M: {
                            Questions: {
                                L: [
                                    {
                                        
                                              S: `${firstFiveSentences[0]}` 
                                        
                                    },
                                    {
                                       
                                              S: `${firstFiveSentences[1]}` 
                                        
                                    },
                                    {
                                        
                                        S: `${firstFiveSentences[2]}` 
                                        
                                    },
                                    {
                                        
                                        S: `${firstFiveSentences[3]}` 
                                        
                                    },
                                    {
                                      
                                        S: `${firstFiveSentences[4]}` 
                                      }
                                  
                                ]
                            },
                            Task: {
                                M: {
                                    S3key: { S: `${listIDs[0]}.${objectNames[0].split('.').pop()}` },
                                    text: { S: `${parsedBody[1][0]}` },
                                }
                            }
                        }
                    },
                    P3: {
                        M: {
                            Questions: {
                                L: [
                                    {
                                        M: {
                                            S3key: { S: `${listIDs[4]}.${objectNames[4].split('.').pop()}` },
                                            text: { S: `${parsedBody[1][4]}` },
                                        }
                                    },
                                    {
                                        M: {
                                            S3key: { S: `${listIDs[5]}.${objectNames[5].split('.').pop()}` },
                                            text: { S: `${parsedBody[1][5]}` },
                                        }
                                    },
                                    {
                                        M: {
                                            S3key: { S: `${listIDs[6]}.${objectNames[6].split('.').pop()}` },
                                            text: { S: `${parsedBody[1][6]}` },
                                        }
                                    }
                                ]
                            },
                            Task: {
                                M: {
                                    S3key: { S: `${listIDs[0]}.${objectNames[0].split('.').pop()}` },
                                    text: { S: `${parsedBody[1][0]}` },
                                }
                            }
                        }
                    }
                }
            }
        });
        transactItems.push({
          Update: {
              TableName: tableName,
              Key: { // Key is required for Update
                  PK: { S: "speaking" },
                  SK: { S: "index" },
              },
              UpdateExpression: "SET #index = list_append(if_not_exists(#index, :empty_list), :new_element)",
              ExpressionAttributeNames: {
                  "#index": "index"
              },
              ExpressionAttributeValues: {
                  ":new_element": { L: [{ S: id }] },
                  ":empty_list": { L: [] } // Important for creating the list if it doesn't exist
              },
          },
      });
      const transactParams = { TransactItems: transactItems };
      const command = new TransactWriteItemsCommand(transactParams);
      const response = await dynamodb.transactWriteItems(transactParams).promise();
      
    
    const userID = event.requestContext.authorizer!.jwt.claims.sub; // Target user ID
    const bucketName = Bucket.ExtractedTXT.bucketName; // Name of the Extracted txt S3 bucket
    const pdfBucket = Bucket.BucketTextract.bucketName;

    // List all objects in the S3 bucket
    const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    const objectsPDF = await s3.listObjectsV2({ Bucket: pdfBucket }).promise();


    let targetObjectKey: string | null = null;
    let targetObjectKeyPDF: string | null = null;


    // Find the object whose name contains the userID
    for (const obj of objects.Contents || []) {
      if (obj.Key && obj.Key.includes(userID) && obj.Key.includes("Speaking")) {
        targetObjectKey = obj.Key;
        break;
      }
    }
    for (const obj of objectsPDF.Contents || []) {
        if (obj.Key && obj.Key.includes(userID)) {
          targetObjectKeyPDF = obj.Key;
          break;
        }
      }

    if (!targetObjectKey || !targetObjectKeyPDF) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No object found for userID: ${userID}` }),
      };
    }

      
      for(let i = 0; i< objectNames.length; i++){
        let objectKey = objectNames[i]
        const fullobjectKey = `unApproved/Speaking/${objectKey}`; // The original object key
        const fileType = objectKey.split('.').pop()
        const idKey = listIDs[i]
        const newObjectKey = `${idKey}.${fileType}`; // New destination object key
            try {
            console.log("Inside the try block!");
        
            // Step 1: Get the object from the source bucket
            const objectData = await s3
                .getObject({
                Bucket: sourceBucket,
                Key: fullobjectKey,
                })
                .promise();
            console.log("Object retrieved successfully:", objectData);
        
            // Step 2: Put the object in the destination bucket with the new key
            await s3
                .putObject({
                Bucket:  destinationBucket,
                Key: newObjectKey,
                Body: objectData.Body, // Use the retrieved object data
                ContentType: objectData.ContentType, // Optional: retain original content type
                })
                .promise();
            console.log(`Object uploaded successfully to `);
        
            // Step 3: Delete the object from the source bucket
            await s3
                .deleteObject({
                Bucket:  sourceBucket,
                Key: fullobjectKey,
                })
                .promise();
            console.log(`Object deleted successfully from ${sourceBucket}/${fullobjectKey}`);
            } catch (error) {
            console.log("Inside the catch block!");
            console.error("Error moving object:", error);
            }
      }
      

    // Retrieve the content of the target object
    const targetObject = await s3
      .deleteObject({ Bucket: bucketName, Key: targetObjectKey })
      .promise();
    const targetObjectpdf = await s3
      .deleteObject({ Bucket: pdfBucket, Key: targetObjectKeyPDF })
      .promise();

    
    

    return {
        statusCode: 200,
        body: JSON.stringify({
          
        }),
      };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error'}),
    };
  }
};
