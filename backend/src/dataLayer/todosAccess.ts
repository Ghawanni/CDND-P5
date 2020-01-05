import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import {TodoItem} from '../models/TodoItem';
import {TodoUpdate} from '../models/TodoUpdate';
const XAWS = AWSXRay.captureAWS(AWS);

export class TodosAccess {
  constructor(
    private docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private S3 = new XAWS.S3({signatureVersion: "v4"}),
    private todosTable = process.env.TODOS_TABLE,
    private bucket = process.env.TODOS_S3_BUCKET,
    private urlExp = process.env.SIGNED_URL_EXPIRATION,
){}
  
    async getTodos(userId:string): Promise < TodoItem[] > {
      console.log('Getting Todos for this user: ', userId);

      const results = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: "userId = :uId",
        ExpressionAttributeValues: {
          ":uId": userId
        }
    })
    .promise();

    const todoItems = results.Items;
    return todoItems as TodoItem[];

    }

    async createTodo(newTodo:TodoItem): Promise<TodoItem>{
      await this.docClient.put({
        TableName: this.todosTable,
        Item: newTodo
      }).promise();
    
      return newTodo;
    }

    async deleteTodo(todoId:string, userId:string){
      
      const deleted = await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      }).promise();

      return deleted;
    }

    async updateTodo(userId:string, todoId:string, updatedTodo:TodoUpdate){
      const updated = await this.docClient.update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: 'set todoName = :n, dueDate = :d, done = :y',
        ExpressionAttributeValues: {
          ':n':updatedTodo.name,
          ':d':updatedTodo.dueDate,
          ':y':updatedTodo.done
        },
        ReturnValues: "UPDATED_NEW"
      }).promise();
      return updated;
    }

    async generateUploadUrl(todoId:string, userId: string): Promise<string>{

      const uploadUrl = this.S3.getSignedUrl("putObject", {
        Bucket: this.bucket,
        Key: todoId,
        Expires: this.urlExp
      })
    
      await this.docClient.update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(userId)',
        UpdateExpression: 'set attachmentUrl = :u',
        ExpressionAttributeValues: {
          ":u":uploadUrl.split("?")[0]
        },
      }).promise();
    
      return uploadUrl;
  }
  
}