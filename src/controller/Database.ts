import * as dotenv from "dotenv";
import * as mongodb from "mongodb";
import { Filter } from "mongodb";

dotenv.config();

const uri = String(process.env.DB_CONN_STRING);
let client: mongodb.MongoClient;

export async function connectDB() {
  client = await mongodb.MongoClient.connect(String(process.env.DB_CONN_STRING));
  console.log(uri);
  // Use connect method to connect to the server
  console.log("");
  return "done.";
}

export async function closeDB() {
  await client.close();
  return "connection closed.";
}

export async function getDataDB(dbName: string, collection: string) {
  return await client.db(dbName).collection(collection).findOne();
}

export async function sendDataDB(dbName: string, collection: string, payload: object) {
  return await client.db(dbName).collection(collection).insertOne(payload);
}

export async function deleteDataDB(dbName: string, collection: string, filter: Filter<object>) {
  return await client.db(dbName).collection(collection).deleteOne(filter);
}
