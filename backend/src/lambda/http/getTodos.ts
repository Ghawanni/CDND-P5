import 'source-map-support/register'
import { getTodos } from '../../businessLogic/Todos';
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // NOTE: Get all TODO items for a current user

  console.log('processing event: ', event);

  const todos = await getTodos(event);
  console.log('results: ', todos);

  return{
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      todos
    })
  }
}
