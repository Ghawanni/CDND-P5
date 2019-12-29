import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import {
  CreateTodoRequest
} from '../../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'

// NOTE: Implement creating a new TODO item

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise < APIGatewayProxyResult > => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  console.log('processing event: ', event);
  const itemId = uuid.v4();
  const userId = getUserId(event);

  const newItem = {
    todoId: itemId,
    userId,
    createdAt: Date.now.toString,
    ...newTodo,
    done: false
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newItem
    })
  }
}