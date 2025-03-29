//const userID = event.requestContext.authorizer!.jwt.claims.sub;
import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { Table } from 'sst/node/table';
import * as AWS from 'aws-sdk';
const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userID = event.requestContext.authorizer!.jwt.claims.sub; // Target user ID
    const bucketName = Bucket.ExtractedTXT.bucketName; // Name of the S3 bucket
    const pdfBucket = Bucket.BucketTextract.bucketName;
     const dynamodb = new AWS.DynamoDB();
          const tableName = Table.Records.tableName;
          if (!event.body) {
              return { statusCode: 400, body: JSON.stringify({ message: "No body provided in the event" }) };
          }
          let p1Question;
          let p2Question;
          console.log("events:" , event.body);
          const parsedBody = JSON.parse(JSON.parse(event.body))
          console.log("ONE PARSE:", parsedBody)
          p1Question = parsedBody.validSections[0]
          console.log("Questions?:", p1Question)
          console.log("Can we get the choices?:", parsedBody.validSections[0].choices )
          const sourceBucket = Bucket.speakingPolly.bucketName;
            const destinationBucket = Bucket.speakingPolly.bucketName;
            let listIDs = []
            for (let i = 0; i<4; i++){
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
    
          parsedBody.audioS3Urls = parsedBody.audioS3Urls.map((url:string) => url.split('/').pop());

          for (const fullQuestion of parsedBody.validSections) {
            const { question, choices, selectedAnswer } = fullQuestion;
            console.log('Question:', question)
            console.log('Selected Answer:', selectedAnswer)
          }
          const transactItems: any[] = [];
          let id = uuidv4();
          let checker = true;
          while(checker) {
            const check = await dynamodb
            .query({
              TableName: tableName,
              KeyConditionExpression: 'PK = :pk AND SK = :sk',
              ExpressionAttributeValues: {
                ':pk': { S: 'listening' },  // String value for PK
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
                PK: { S: "listening" },
                SK: { S: id },
                P1: {
                  M: {
                    NumOfQuestions: { N: "1" },
                    Questions: {
                      L: [
                        {
                          M: {
                            NumOfSubQuestions: { N: "3" },
                            Question: { S: "Listen and answer the questions." },
                            QuestionType: { S: "Short Answers" },
                            SubQuestions: {
                              L: [
                                {
                                  M: {
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[0].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[0].question}-answer-` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                                {
                                  M: {
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[1].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[1].question}-answer-` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                                {
                                  M: {
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[2].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[2].question}-answer-` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                    ScriptKey: { S: `${listIDs[0]}.${parsedBody.audioS3Urls[0].split('.').pop()}` },
                  },
                },
                P2: {
                  M: {
                    NumOfQuestions: { N: "1" },
                    Questions: {
                      L: [
                        {
                          M: {
                            NumOfSubQuestions: { N: "3" },
                            Question: { S: "Listen and answer the questions." },
                            QuestionType: { S: "Multiple Answers" },
                            SubQuestions: {
                              L: [
                                {
                                  M: {
                                    Choices: {
                                      L: parsedBody.validSections[3].choices.map((choice: string) => ({ S: choice })),
                                    },
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[3].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[3].question}` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                                {
                                  M: {
                                    Choices: {
                                      L: parsedBody.validSections[4].choices.map((choice: string) => ({ S: choice })),
                                    },
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[4].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[4].question}` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                                {
                                  M: {
                                    Choices: {
                                      L: parsedBody.validSections[5].choices.map((choice: string) => ({ S: choice })),
                                    },
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[5].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[5].question}` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                    ScriptKey: { S: `${listIDs[1]}.${parsedBody.audioS3Urls[1].split('.').pop()}` },
                  },
                },
                P3: {
                  M: {
                    NumOfQuestions: { N: "1" },
                    Questions: {
                      L: [
                        {
                          M: {
                            NumOfSubQuestions: { N: "3" },
                            Question: { S: "Listen and answer the questions." },
                            QuestionType: { S: "Multiple Choice" },
                            SubQuestions: {
                              L: [
                                {
                                  M: {
                                    Choices: {
                                      L: parsedBody.validSections[6].choices.map((choice: string) => ({ S: choice })),
                                    },
                                    CorrectAnswer: { S: `${parsedBody.validSections[6].selectedAnswer}` }, 
                                    QuestionText: { S: `${parsedBody.validSections[6].question}` },
                                  },
                                },
                                {
                                  M: {
                                    Choices: {
                                      L: parsedBody.validSections[7].choices.map((choice: string) => ({ S: choice })),
                                    },
                                    CorrectAnswers: { S: `${parsedBody.validSections[7].selectedAnswer}` },
                                    QuestionText: { S: `${parsedBody.validSections[7].question}` },
                                  },
                                },
                                {
                                  M: {
                                    Choices: {
                                      L: parsedBody.validSections[8].choices.map((choice: string) => ({ S: choice })),
                                    },
                                    CorrectAnswers: { S: `${parsedBody.validSections[8].selectedAnswer}`},
                                    QuestionText: { S: `${parsedBody.validSections[8].question}` },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                    ScriptKey: { S: `${listIDs[2]}.${parsedBody.audioS3Urls[2].split('.').pop()}` },
                  },
                },
                P4: {
                  M: {
                    NumOfQuestions: { N: "1" },
                    Questions: {
                      L: [
                        {
                          M: {
                            NumOfSubQuestions: { N: "3" },
                            Question: { S: "Listen and answer the questions." },
                            QuestionType: { S: "Short Answers" },
                            SubQuestions: {
                              L: [
                                {
                                  M: {
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[9].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[9].question}-answer-` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                                {
                                  M: {
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[10].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[10].question}-answer-` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                                {
                                  M: {
                                    CorrectAnswers: { 
                                      L: [ 
                                        { 
                                          L: [ 
                                            { S: `${parsedBody.validSections[11].selectedAnswer}` } 
                                          ] 
                                        } 
                                      ] 
                                    },
                                    QuestionText: { S: `${parsedBody.validSections[11].question}-answer-` },
                                    QuestionWeight: { N: "1" },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                    ScriptKey: { S: `${listIDs[3]}.${parsedBody.audioS3Urls[3].split('.').pop()}` },
                  },
                },
              },
            },
          });
          
          transactItems.push({
            Update: {
                TableName: tableName,
                Key: { // Key is required for Update
                    PK: { S: "listening" },
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
    // List all objects in the S3 bucket
    const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    const objectsPDF = await s3.listObjectsV2({ Bucket: pdfBucket }).promise();


    let targetObjectKey: string | null = null;
    let targetObjectKeyPDF: string | null = null;


    // Find the object whose name contains the userID
    for (const obj of objects.Contents || []) {
      if (obj.Key && obj.Key.includes(userID) && obj.Key.includes("Listening")) {
        targetObjectKey = obj.Key;
        break;
      }
    }
    for (const obj of objectsPDF.Contents || []) {
        if (obj.Key && obj.Key.includes(userID) /*&&  obj.Key.includes("Listening")*/) {
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
         
          for(let i = 0; i< parsedBody.audioS3Urls.length; i++){
            let objectKey = parsedBody.audioS3Urls[i].split("/").pop()
            const fullobjectKey = `unApproved/Listening/${objectKey}`; // The original object key
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
