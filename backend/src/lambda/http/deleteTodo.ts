import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { getUserId } from '../utils';

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise < APIGatewayProxyResult > => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  // NOTE: Remove a TODO item by id

  await docClient.delete({
    TableName: tableName,
    Key: {
      userId,
      todoId
    }
  }).promise();

  return {
    statusCode: 204,
    body:JSON.stringify({
      todoId
    })
  }
}