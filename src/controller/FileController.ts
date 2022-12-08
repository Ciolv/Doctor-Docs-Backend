import { Body, Controller, Example, Path, Post, Query, Route, UploadedFile, FormField } from "tsoa";
import { File } from "../model/File";
import { User } from "../model/User";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import { Readable } from "stream";
import { ObjectId, UpdateFilter } from "mongodb";
import { AuthenticationIsValid, getUserId } from "../utils/AuthenticationHelper";
import { AuthenticationBody } from "../model/Authentication";

type PermitBody = AuthenticationBody & {
  action: "ADD" | "DELETE";
  userId: string;
  role: "DOCTOR" | "PATIENT";
};

@Route("files")
export class FileController extends Controller {
  @Example<File>({
    id: "6371fe0803b918f1869cb865",
    marked: false,
    name: "Demo Document",
    parentId: "9371fe0803b918f1869cb865",
    content: { iv: "", authTag: "", data: "" },
    ownerId: "5371fe0803b918f1869cb865",
    users: [new Permission("3371fe0803b918f1869cb865", FilePermission.Delete)],
    lastUpdateTime: new Date(),
    size: 500,
    addUserPermission(): void {
      return;
    },
  })
  parentId = "";

  readDatabaseHandler: Database = new Database(DatabaseUser.LEGET, "documents", "files");
  writeDatabaseHandler: Database = new Database(DatabaseUser.SCRIBIT, "documents", "files");
  deleteDatabaseHandler: Database = new Database(DatabaseUser.EXSTINGUET, "documents", "files");
  updateDatabaseHandler: Database = new Database(DatabaseUser.REPONIT, "documents", "files");

  readDoctorsHandler: Database = new Database(DatabaseUser.LEGET, "accounts", "doctors");
  readUsersHandler: Database = new Database(DatabaseUser.LEGET, "accounts", "users");

  @Post("get/{fileId}")
  public async getFile(@Path() fileId: string, @Body() body: AuthenticationBody) {
    const userId = await getUserId(body.jwt);
    if (userId === "") {
      return null;
    }
    const response = await this.readDatabaseHandler.getFile(fileId, userId);
    if (response !== null) {
      const file = response as unknown as Buffer;
      return Readable.from(file);
    }

    return null;
  }

  @Post("")
  public async getAllFiles(@Body() body: AuthenticationBody) {
    const userId = await getUserId(body.jwt);
    if (userId === "") {
      return null;
    }

    if (await AuthenticationIsValid(body.jwt)) {
      return await this.readDatabaseHandler.getAllFiles(userId);
    }

    return null;
  }

  @Post("/mark/{fileId}")
  public async setMark(@Path() fileId: string, @Query() value: boolean, @Body() body: AuthenticationBody) {
    const userId = await getUserId(body.jwt);
    if (userId === "") {
      return null;
    }
    return await this.updateDatabaseHandler.updateFile(fileId, { $set: { marked: value } }, userId);
  }

  @Post("/delete/{fileId}")
  public async delete(@Path() fileId: string, @Body() body: AuthenticationBody) {
    const userId = await getUserId(body.jwt);
    if (userId === "") {
      return null;
    }
    return await this.deleteDatabaseHandler.deleteFile(fileId, userId);
  }

  @Post("/permit/{fileId}/")
  public async permit(@Path() fileId: string, @Body() body: PermitBody) {
    const loggedInUserId = await getUserId(body.jwt);
    if (loggedInUserId === "") {
      return null;
    }
    let userIdVar;
    let medExists;
    if (body.role === "DOCTOR") {
      userIdVar = body.userId;
      medExists = await this.readDoctorsHandler.userExists(userIdVar);
    } else {
      let user;
      if (body.action === "ADD") {
        user = (await this.readUsersHandler.getData({ insurance_number: body.userId })) as unknown as User;
      } else {
        user = (await this.readUsersHandler.getData({ id: body.userId })) as unknown as User;
      }
      userIdVar = user.id;
      medExists = await this.readUsersHandler.userExists(userIdVar);
    }
    if (medExists !== null) {
      // Medical User Exists and can be added to file permission
      let changes: UpdateFilter<File> = {};
      const permissionField = {
        users: {
          userId: userIdVar,
          permission: FilePermission.Read,
        },
      };
      if (body.action === "ADD") {
        changes = {
          $addToSet: {
            ...permissionField,
          },
        };
      } else {
        if (body.action === "DELETE") {
          changes = {
            $pull: {
              ...permissionField,
            },
          };
        }
      }
      return await this.updateDatabaseHandler.updateFile(fileId, changes, loggedInUserId);
    }
    // Invalid request - User does not exist under the specified ID
    this.setStatus(500);
    return "Invalid Query - No such userId.";
  }

  @Post("upload")
  public async uploadFile(
    @FormField() jwt: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<boolean | ObjectId> {
    const userId = await getUserId(jwt);
    if (userId !== "" && file !== undefined) {
      return await this.writeDatabaseHandler.uploadFile(
        file.originalname,
        file.size,
        file.buffer,
        userId,
        this.parentId
      );
    }

    return false;
  }
}
