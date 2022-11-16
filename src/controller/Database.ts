import * as dotenv from "dotenv";
import { DatabaseUser } from "../model/DatabaseUser";
import { Filter, MongoClient, ObjectId } from "mongodb";
import { File } from "../model/File";
import { Permission } from "../model/Permission";
import { FilePermission } from "../model/FilePermission";

dotenv.config();

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
    }
    this.database = database;
    this.collection = collection;
    this.client = new MongoClient(this.url);
  }

  async getFile(fileId: string, userId: string) {

    const fileObjectId = new ObjectId(fileId);
    const requiredPermission = new Permission(userId, FilePermission.Write)
    const filter = {
      _id: fileObjectId,
      "users": [
        requiredPermission
      ]
    };

    const file = await this.getData(filter);
    if (file !== null) {
      return file as unknown as File;
    }

    return File.prototype;
  }

  async getData(filter: Filter<Object>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).findOne(filter);
  }

  async insertData(data: Object) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).insertOne(data);
  }

  async deleteData(filter: Filter<Object>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).deleteOne(filter);
  }

  async close() {
    await this.client.close();
  }
}
