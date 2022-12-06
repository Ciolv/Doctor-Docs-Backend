import { Permission } from "./Permission";
import { FilePermission } from "./FilePermission";
import { EncryptionResult } from "../utils/encryption";

export class File {
  id = "";
  name: EncryptionResult | string;
  content: EncryptionResult;
  parentId: string;
  ownerId: string;
  size: number;
  lastUpdateTime: Date;
  users: Permission[];
  marked = false;

  constructor(name: EncryptionResult | string,
              content: EncryptionResult,
              parentId: string,
              ownerId: string,
              size: number) {
    this.name = name;
    this.content = content;
    this.parentId = parentId;
    this.ownerId = ownerId;
    this.users = [new Permission(ownerId, FilePermission.Delete)];
    this.size = size;
    this.lastUpdateTime = new Date();
  }

  addUserPermission(userId: string, permission: FilePermission) {
    this.users = this.users.concat(...[new Permission(userId, permission)]);
  }
}
