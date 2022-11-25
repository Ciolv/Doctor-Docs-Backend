import { FilePermission } from "./FilePermission";
import { ObjectId } from "mongodb";

export class Permission {
  userId;
  permission;

  constructor(userId: string | ObjectId, permission: FilePermission) {
    this.userId = userId;
    this.permission = permission;
  }
}
