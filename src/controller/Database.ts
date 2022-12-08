import { config } from "dotenv";
import { DatabaseUser } from "../model/DatabaseUser";
import { Filter, FindOptions, MongoClient, ObjectId, UpdateFilter } from "mongodb";
import { File } from "../model/File";
import { FilePermission } from "../model/FilePermission";
import { User } from "../model/User";
import { objectDiff } from "../utils/ObjectHelper";
import { decrypt, encrypt, EncryptionResult } from "../utils/encryption";

config();
const MAX_FILE_BYTE_SIZE = 419430400; // equals 50 MiB

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

  static getUserPermissionFilter(userId: string, permission: FilePermission) {
    return {
      users: {
        $elemMatch: {
          userId: userId,
          permission: { $gte: permission },
        },
      },
    };
  }

  async getFile(fileId: string, userId: string) {
    const fileObjectId = new ObjectId(fileId);
    const userPermission = Database.getUserPermissionFilter(userId, FilePermission.Read);
    const filter = {
      _id: fileObjectId,
      ...userPermission,
    };

    const file = await this.getData(filter);

    if (file !== null) {
      return decrypt(file.content);
    }

    return new Blob();
  }

  async deleteFile(fileId: string, userId: string) {
    const userPermissions = Database.getUserPermissionFilter(userId, FilePermission.Delete);
    const filter = { _id: new ObjectId(fileId), ...userPermissions };
    return await this.deleteData(filter);
  }

  async getUser(userId: string): Promise<User | boolean> {
    let filter;
    try {
      const userObjectId = new ObjectId(userId);
      filter = {
        _id: userObjectId,
      };
    } catch {
      filter = {
        id: userId,
      };
    }

    const user = (await this.getData(filter)) as unknown as User;

    if (user !== null) {
      if (user.approbation === "") {
        const postcode = decrypt(user.postcode as EncryptionResult);
        const number = decrypt(user.number as EncryptionResult);

        user.street = decrypt(user.street as EncryptionResult)?.toString() ?? "";
        user.city = decrypt(user.city as EncryptionResult)?.toString() ?? "";
        user.last_name = decrypt(user.last_name as EncryptionResult)?.toString() ?? "";
        user.first_name = decrypt(user.first_name as EncryptionResult)?.toString() ?? "";
        user.insurance = decrypt(user.insurance as EncryptionResult)?.toString() ?? "";
        user.number = number ? parseInt(number.toString()) : 0;
        user.postcode = postcode ? parseInt(postcode.toString()) : 0;
      }

      return user;
    }

    return false;
  }

  async getAllFiles(userId: string) {
    const userPermission = Database.getUserPermissionFilter(userId, FilePermission.Read);
    const filter = {
      ...userPermission,
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

    const files = await this.getAllData(filter, options);
    for (const file of files) {
      const name = decrypt(file.name as EncryptionResult)?.toString();
      if (name !== undefined) {
        file.name = name;
      }
    }

    return files;
  }

  async uploadFile(fileName: string, size: number, buffer: Buffer, userId: string, parentId: string) {
    if (size < MAX_FILE_BYTE_SIZE) {
      const fileData = encrypt(buffer);
      const encryptedFileName = encrypt(Buffer.from(fileName));
      const file = new File(encryptedFileName, fileData, parentId, userId, size);

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

  async updateUser(patient: User) {
    const userId = await this.userExists(patient.id);

    if (userId !== null) {
      const user = await this.getUser(userId.toString());
      if (user !== null) {
        const diff = objectDiff(user, patient);
        if (diff !== undefined && Object.entries(diff).length !== 0) {
          for (const diffElement of Object.keys(diff)) {
            if (patient.approbation === "") {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              diff[diffElement] = encrypt(diff[diffElement].toString());
            }
          }
          const res = await this.updateData({ _id: userId }, { $set: diff });
          return { success: res.acknowledged };
        }
        // There is no difference in the DB object and the request object
        return { success: true };
      }
    }
    if (patient.approbation === "") {
      for (const patientKey of Object.keys(patient)) {
        if (patientKey === "id" || patientKey === "insurance_number" || patient.approbation !== "") {
          continue;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        patient[patientKey] = encrypt(patient[patientKey].toString());
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

  async updateFile(fileId: string, changes: UpdateFilter<object>, userId: string) {
    const userPermissions = Database.getUserPermissionFilter(userId, FilePermission.Write);
    const queryFilter = {
      _id: new ObjectId(fileId),
      ...userPermissions,
    };

    return await this.updateData(queryFilter, changes);
  }

  async updateData(filter: Filter<object>, changes: UpdateFilter<object>) {
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
