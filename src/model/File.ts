import { Permission } from "./Permission";
import { FilePermission } from "./FilePermission";

export class File {
  id = "";
  name: string;
  content: object;
  parentId: string;
  ownerId: string;
  users: Permission[];

  constructor(name: string, content: object, parentId: string, ownerId: string) {
    this.name = name;
    this.content = content;
    this.parentId = parentId;
    this.ownerId = ownerId;
    this.users = [new Permission(ownerId, FilePermission.Delete)];
  }

  addUserPermission(userId: string, permission: FilePermission) {
    this.users = this.users.concat(...[new Permission(userId, permission)]);
  }
}
