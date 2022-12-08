import { Body, Controller, Example, FormField, Path, Post, Query, Route, UploadedFile } from "tsoa";
import { File } from "../model/File";
import { User } from "../model/User";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import { Readable } from "stream";
import { UpdateFilter } from "mongodb";
import { getUserId } from "../utils/AuthenticationHelper";
import { AuthenticationBody } from "../model/Authentication";
import { Logger } from "../utils/Log";

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
                   }
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
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warning(`Unauthenticated user tried to access file ${fileId}`);
        this.setStatus(403);
        return;
      }

      const response = await this.readDatabaseHandler.getFile(fileId, userId);
      if (response !== null) {
        Logger.info(`User ${userId} downloaded file ${fileId}`);
        const file = response as unknown as Buffer;
        this.setStatus(200);
        return Readable.from(file);
      }

      Logger.warning(`User ${userId} tried to download file ${fileId}, but this file does not exist`);
      this.setStatus(404);
      return "File not found";
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("")
  public async getAllFiles(@Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warning(`Unauthenticated user tried to get all files.`);
        this.setStatus(403);
        return;
      }
      this.setStatus(200);
      Logger.info(`User ${userId} fetched available files`);
      return await this.readDatabaseHandler.getAllFiles(userId);
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("/mark/{fileId}")
  public async setMark(@Path() fileId: string, @Query() value: boolean, @Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warning(`Unauthenticated user tried set mark state to '${value.valueOf()}' for file ${fileId}`);
        this.setStatus(403);
        return;
      }

      Logger.info(`User ${userId} changed mark state for file ${fileId}`);
      this.setStatus(200);
      return await this.updateDatabaseHandler.updateFile(fileId, { $set: { marked: value } }, userId);
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("/delete/{fileId}")
  public async delete(@Path() fileId: string, @Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warning(`Unauthenticated user tried to delete file ${fileId}`);
        this.setStatus(403);
        return;
      }

      this.setStatus(204);
      const result = await this.deleteDatabaseHandler.deleteFile(fileId, userId);
      if (result.deletedCount === 0) {
        const updateResult = await this.updateDatabaseHandler.removeReadPermission(fileId, userId);

        if (updateResult.modifiedCount !== 0) {
          Logger.info(`User ${userId} removed own file permission for file ${fileId}`);
          return updateResult;
        } else {
          Logger.warning(`Could not delete file or permission for user ${userId} and file ${fileId}`);
          this.setStatus(500)
          return "Could not modify the given file";
        }
      } else {
        Logger.info(`User ${userId} deleted files ${fileId}`);
        return result;
      }
    } catch (e: any) {
      Logger.error(e.message);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("/permit/{fileId}/")
  public async permit(@Path() fileId: string, @Body() body: PermitBody) {
    try {
      const loggedInUserId = await getUserId(body.jwt);
      if (loggedInUserId === "") {
        this.setStatus(403);
        return;
      }

      let userIdVar;
      let medExists;
      if (body.role === "DOCTOR") {
        userIdVar = body.userId;
        medExists = await this.readDoctorsHandler.userExists(userIdVar);
      } else {
        let user;
        if (body.action === "ADD") {
          user =
            (await this.readUsersHandler.getData({ insurance_number: body.userId })
            ) as unknown as User;
        } else {
          user =
            (await this.readUsersHandler.getData({ id: body.userId })
            ) as unknown as User;
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
            permission: FilePermission.Read
          }
        };
        if (body.action === "ADD") {
          changes = {
            $addToSet: {
              ...permissionField
            }
          };
        } else {
          if (body.action === "DELETE") {
            changes = {
              $pull: {
                ...permissionField
              }
            };
          }
        }

        Logger.info(`User ${loggedInUserId} ${body.action} access for file ${fileId} and user ${userIdVar}`);
        this.setStatus(200);
        return await this.updateDatabaseHandler.updateFile(fileId, changes, loggedInUserId);
      }
      // Invalid request - User does not exist under the specified ID
      this.setStatus(404);
      return "Invalid Query - No such userId.";
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("upload")
  public async uploadFile(@FormField() jwt: string, @UploadedFile() file: Express.Multer.File) {
    try {
      const userId = await getUserId(jwt);
      if (userId === "") {
        Logger.warning(`Unauthenticated user tried to upload a file`);
        this.setStatus(403);
        return;
      }

      if (file === undefined) {
        this.setStatus(404);
        return "No file selected";
      }


      Logger.info(`User ${userId} uploaded a new file`);
      this.setStatus(200);
      return await this.writeDatabaseHandler.uploadFile(
        file.originalname,
        file.size,
        file.buffer,
        userId,
        this.parentId
      );
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }
}
