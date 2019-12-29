import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  // NOTE: Update a TODO item with the provided id using values in the "updatedTodo" object
  await docClient.update({
    TableName: tableName,
    Key: { userId, todoId },
    ConditionExpression: 'attribute_exists(userId)',
    UpdateExpression: 'set todoName = :n, dueDate = :d, done = :y',
    ExpressionAttributeValues: {
      ':n':updatedTodo.name,
      ':d':updatedTodo.dueDate,
      ':y':updatedTodo.done
    },
  }).promise();

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      updatedTodo
    })
  }

}
