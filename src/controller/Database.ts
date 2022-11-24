import { config } from "dotenv";
import { DatabaseUser } from "../model/DatabaseUser";
import { Filter, MongoClient } from "mongodb";

config();

export class Database {
  url: string;
  database: string;
  collection: string;
  client: MongoClient;

  constructor(user: DatabaseUser, database: string, collection: string) {
    switch (user) {
      case DatabaseUser.LEGET:
        this.url = process.env.DB_CONN_LEGET || "";
        break;
      case DatabaseUser.SCRIBIT:
        this.url = process.env.DB_CONN_SCRIBIT || "";
        break;
      case DatabaseUser.REPONIT:
        this.url = process.env.DB_CONN_REPONIT || "";
        break;
      case DatabaseUser.EXSTINGUET:
        this.url = process.env.DB_CONN_REPONIT || "";
        break;
      default:
        this.url = process.env.DB_CONN_LEGET || "";
    }
    this.database = database;
    this.collection = collection;
    this.client = new MongoClient(this.url);
  }

  async getData(filter: Filter<Record<string, any>>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).findOne(filter);
  }

  async getMany(filter: Filter<Record<string, any>>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).find(filter).toArray();
  }

  async insertData(data: Record<string, any>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).insertOne(data);
  }

  async deleteData(filter: Filter<Record<string, any>>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).deleteOne(filter);
  }

  async close() {
    await this.client.close();
  }
}
