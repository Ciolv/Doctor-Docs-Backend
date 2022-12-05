import { Body, Controller, Example, Get, Path, Post, Query, Request, Route } from "tsoa";
import { File } from "../model/File";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import express from "express";
import multer from "multer";
import { Readable } from "stream";
import { ObjectId, UpdateFilter } from "mongodb";

type PermitBody = {
  userId: string;
};

@Route("files")
export class FileController extends Controller {
  @Example<File>({
    id: "6371fe0803b918f1869cb865",
    marked: false,
    name: "Demo Document",
    parentId: "9371fe0803b918f1869cb865",
    content: {},
    ownerId: "5371fe0803b918f1869cb865",
    users: [new Permission("3371fe0803b918f1869cb865", FilePermission.Delete)],
    lastUpdateTime: new Date(),
    size: 500,
    addUserPermission(): void {
      return;
    },
  })

  // TODO: Get userId from logged in user, as soon as available
  parentId = "";

  readDatabaseHandler: Database = new Database(DatabaseUser.LEGET, "documents", "files");
  writeDatabaseHandler: Database = new Database(DatabaseUser.SCRIBIT, "documents", "files");
  deleteDatabaseHandler: Database = new Database(DatabaseUser.EXSTINGUET, "documents", "files");
  updateDatabaseHandler: Database = new Database(DatabaseUser.REPONIT, "documents", "files");

  readDoctorsHandler: Database = new Database(DatabaseUser.LEGET, "accounts", "doctors");

  @Get("{fileId}")
  public async getFile(@Path() fileId: string, @Query() userId: string) {
    const file = (await this.readDatabaseHandler.getFile(fileId, userId)) as Buffer;
    return Readable.from(file);
  }

  @Get("")
  public async getAllFiles(@Query() userId: string) {
    return await this.readDatabaseHandler.getAllFiles(userId);
  }

  @Get("/mark/{fileId}")
  public async setMark(@Path() fileId: string, @Query() value: boolean) {
    return await this.updateDatabaseHandler.updateFile({ _id: new ObjectId(fileId) }, { $set: { marked: value } });
  }

  @Get("/delete/{fileId}")
  public async delete(@Path() fileId: string) {
    return await this.deleteDatabaseHandler.deleteData({ _id: new ObjectId(fileId) });
  }

  @Post("/permit/{fileId}")
  public async permit(@Path() fileId: string, @Body() body: PermitBody) {
    const medExists = await this.readDoctorsHandler.userExists(body.userId);
    if (medExists !== null) {
      // Medical User Exists and can be added to file permission
      const changes: UpdateFilter<File> = {
        $addToSet: {
          users: {
            userId: body.userId,
            permission: 1,
          },
        },
      };
      return await this.updateDatabaseHandler.updateFile({ _id: new ObjectId(fileId) }, changes);
    } else {
      // Invalid request - User does not exist under the specified ID
      console.log("FileController request");
      this.setStatus(500);
      return "Invalid Query - No such userId.";
    }
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
