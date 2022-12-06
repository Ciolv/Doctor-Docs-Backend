import { config } from "dotenv";
import { DatabaseUser } from "../model/DatabaseUser";
import { Filter, FindOptions, MongoClient, ObjectId, UpdateFilter } from "mongodb";
import { File } from "../model/File";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
import { Patient } from "../model/Patient";
import { objectDiff } from "../utils/ObjectHelper";

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
        this.url = process.env.DB_CONN_EXSTINGUET || "";
        break;
      default:
        this.url = process.env.DB_CONN_LEGET || "";
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
      "users.permission": { $gte: FilePermission.Read },
    };

    const file = await this.getData(filter);

    if (file !== null) {
      return file.content.buffer as Buffer;
    }

    return new Blob();
  }

  async getUser(userId: string): Promise<Patient> {
    try {
      const userObjectId = new ObjectId(userId);
      const filter = {
        _id: userObjectId,
      };

      const user = await this.getData(filter);
      return user as unknown as Patient;
    } catch {
      const filter = {
        id: userId,
      };

      const user = await this.getData(filter);
      return user as unknown as Patient;
    }
  }

  async getAllFiles(userId: string) {
    const filter = {
      ownerId: userId,
      "users.userId": userId,
      "users.permission": { $gte: FilePermission.Read },
    };

    const options = {
      projection: {
        _id: 1,
        name: 1,
        parentId: 1,
        ownerId: 1,
        users: 1,
        size: 1,
        marked: 1,
        lastUpdateTime: 1,
      },
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

  async userExists(userId: string) {
    const filter = {
      id: userId,
    };

    const res = await this.getData(filter);
    return res !== null ? res._id : null;
  }

  async updateUser(patient: Patient) {
    const userId = await this.userExists(patient.id);

    if (userId !== null) {
      const user = await this.getUser(userId.toString());
      if (user !== null) {
        const diff = objectDiff(user, patient);
        if (diff !== undefined && Object.entries(diff).length !== 0) {
          const res = await this.updateFile({ _id: userId }, { $set: diff });
          return { success: res.acknowledged };
        }
        // There is no difference in the DB object and the request object
        return { success: true };
      }
    }
    const res = await this.insertData(patient);
    return {
      success: res.acknowledged,
      id: res.acknowledged ? res.insertedId : "",
    };
  }

  async getData(filter: Filter<Record<string, unknown>>) {
    await this.client.connect();
    const result = await this.client.db(this.database).collection(this.collection).findOne(filter);
    await this.close();
    return result;
  }

  async getAllData(filter: Filter<object>, options: FindOptions<object>) {
    await this.client.connect();
    const result = this.client.db(this.database).collection<File>(this.collection).find(filter, options);

    const documents: File[] = [];
    // skipcq:  JS-0032
    while (await result.hasNext()) {
      // skipcq:  JS-0032
      const doc = await result.next();
      documents.push(<File>doc);
    }
    await this.close();
    return documents;
  }

  async getMany(filter: Filter<Record<string, unknown>>) {
    await this.client.connect();
    return await this.client.db(this.database).collection(this.collection).find(filter).toArray();
  }

  async insertData(data: object) {
    await this.client.connect();
    const result = await this.client.db(this.database).collection(this.collection).insertOne(data);
    await this.close();
    return result;
  }

  async updateFile(filter: Filter<object>, changes: UpdateFilter<object>) {
    await this.client.connect();
    const result = await this.client
      .db(this.database)
      .collection(this.collection)
      .updateOne(filter, changes, { upsert: true });
    await this.close();
    return result;
  }

  async deleteData(filter: Filter<Record<string, unknown>>) {
    await this.client.connect();
    const result = await this.client.db(this.database).collection(this.collection).deleteOne(filter);
    await this.close();
    return result;
  }

  async close() {
    await this.client.close();
  }
}
