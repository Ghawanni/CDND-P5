import { TodosAccess } from "../dataLayer/todosAccess";
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils';
import { TodoItem } from "../models/TodoItem";
import * as uuid from "uuid";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";




const todoAccess = new TodosAccess();


export async function getTodos(event: APIGatewayProxyEvent): Promise<TodoItem[]>{
  const userId =  getUserId(event)
  const todoItems = todoAccess.getTodos(userId);
  return todoItems;
}


export async function createTodo(event: APIGatewayProxyEvent):Promise<TodoItem>{
  const userId = getUserId(event);
  console.log('Creating todo for user:', userId);
  const itemId = uuid.v4();
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const newItem = await todoAccess.createTodo({
    todoId: itemId,
    userId,
    createdAt: Date.now.toString(),
    ...newTodo,
    done: false
  });

  return newItem;

}

export async function deleteTodo(event: APIGatewayProxyEvent){
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
  const deletedTodo = await todoAccess.deleteTodo(todoId, userId);

  return deletedTodo
}

export async function updateTodo(event: APIGatewayProxyEvent){
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  const result = todoAccess.updateTodo(userId, todoId, updatedTodo);

  return result;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent): Promise<string>{
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);
  const uploadUrl = await todoAccess.generateUploadUrl(todoId, userId);

  return uploadUrl;
}