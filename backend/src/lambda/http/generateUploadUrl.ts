import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import {
  getUserId
} from '../utils';

export const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  params: {
    Bucket: 'todo-app-serverless'
  }
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise < APIGatewayProxyResult > => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);
  const uploadUrl = s3.getSignedUrl("putObject", {
    Bucket: 'todo-app-serverless',
    Key: todoId,
    Expires: process.env.SIGNED_URL_EXPIRATION
  })

  await docClient.update({
    TableName: tableName,
    Key: { userId, todoId },
    ConditionExpression: 'attribute_exists(userId)',
    UpdateExpression: 'set attachmentUrl = :u',
    ExpressionAttributeValues: {
      ":u":uploadUrl
    },
  }).promise();


  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 200,
    body: uploadUrl
  }
}