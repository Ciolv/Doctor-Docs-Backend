import { Body, Controller, Example, Get, Path, Post, Query, Request, Route } from "tsoa";
import { File } from "../model/File";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import express from "express";
import multer from "multer";
import { Readable } from "stream";
import { UpdateFilter } from "mongodb";
import { User } from "../model/User";

type PermitBody = {
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

  @Get("{fileId}")
  public async getFile(@Path() fileId: string, @Query() userId: string) {
    const response = await this.readDatabaseHandler.getFile(fileId, userId);
    if (response !== null) {
      const file = response as unknown as Buffer;
      return Readable.from(file);
    }

    return Readable.from(Buffer.from(""));
  }

  @Get("")
  public async getAllFiles(@Query() userId: string) {
    return await this.readDatabaseHandler.getAllFiles(userId);
  }

  @Get("/mark/{fileId}")
  public async setMark(@Path() fileId: string, @Query() value: boolean, @Query() userId: string) {
    return await this.updateDatabaseHandler.updateFile(fileId, { $set: { marked: value } }, userId);
  }

  @Get("/delete/{fileId}")
  public async delete(@Path() fileId: string, @Query() userId: string) {
    return await this.deleteDatabaseHandler.deleteFile(fileId, userId);
  }

  @Post("/permit/{fileId}/")
  public async permit(@Path() fileId: string, @Body() body: PermitBody) {
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
      console.log(changes);
      return await this.updateDatabaseHandler.updateFile(fileId, changes, userIdVar);
    }
    // Invalid request - User does not exist under the specified ID
    console.log("FileController request");
    this.setStatus(500);
    return "Invalid Query - No such userIdVar.";
  }

  @Post("upload")
  public async uploadFile(@Request() request: express.Request, @Query() userId: string) {
    const multerSingle = multer().single("file");
    await new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      multerSingle(request, undefined, (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });

    if (request.file !== undefined) {
      return await this.writeDatabaseHandler.uploadFile(
        request.file.originalname,
        request.file.size,
        request.file.buffer,
        userId,
        this.parentId
      );
    }

    return Promise.reject(new Error("Could not upload"));
  }
}
