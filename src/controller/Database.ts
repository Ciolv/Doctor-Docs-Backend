import * as dotenv from "dotenv";
import { DatabaseUser } from "../model/DatabaseUser";
import { Filter, FindOptions, MongoClient, ObjectId } from "mongodb";
import { File } from "../model/File";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
// import * as fs from "fs";

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
    const filter = {
      _id: fileObjectId,
      "users.userId": userId,
      "users.permission": { $gte: FilePermission.Read }
    };

    const file = await this.getData(filter);

    if (file !== null) {
      return file.content.buffer as Buffer;
    }

    return new Blob();
  }

  async getAllFiles(userId: string) {
    const filter = {
      "ownerId": userId,
      "users.userId": userId,
      "users.permission": { $gte: FilePermission.Read }
    };

    const options = {
      projection: {
        _id: 1,
        name: 1,
        parentId: 1,
        ownerId: 1,
        users: 1,
        size: 1,
        lastUpdateTime: 1
      }
    };

    return await this.getAllData(filter, options);
  }

  async uploadFile(fileName: string, size: number, buffer: Buffer, userId: string, parentId: string) {
    const maxFileSize = 5000000000000;
    if (size < maxFileSize) {
      const file = new File(fileName, buffer, parentId, userId, size);
      file.users.push(new Permission(userId, FilePermission.Delete));

      const result = await this.insertData(file);
      return result.insertedId;
    }
    return false;
  }

  async getData(filter: Filter<object>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).findOne(filter);
  }

  async getAllData(filter: Filter<object>, options: FindOptions<object>) {
    await this.client.connect();
    const result = this.client.db(this.database).collection<File>(this.collection).find(
      filter,
      options
    );

    const documents: File[] = [];
    while (await result.hasNext()) {
      const doc = await result.next();
      documents.push((<File>doc
                     ));
    }

    return documents;
  }

  async insertData(data: object) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).insertOne(data);
  }

  async deleteData(filter: Filter<object>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).deleteOne(filter);
  }

  async close() {
    await this.client.close();
  }
}
