import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { createTodo } from '../../businessLogic/todos';

// NOTE: Implement creating a new TODO item


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise < APIGatewayProxyResult > => {
  console.log('processing event: ', event);

  const newItem = await createTodo(event);  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      newItem
    })
  }
}