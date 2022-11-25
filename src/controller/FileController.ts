import { Controller, Example, Get, Path, Post, Query, Request, Route } from "tsoa";
import { File } from "../model/File";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import express from "express";
import multer from "multer";
import { Readable } from "stream";

@Route("files")
export class FileController extends Controller {
  @Example<File>({
    id: "6371fe0803b918f1869cb865",
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
  userId = "637201eed818997609ef5915";
  parentId = "";

  readDatabaseHandler: Database = new Database(DatabaseUser.LEGET, "documents", "files");
  writeDatabaseHandler: Database = new Database(DatabaseUser.SCRIBIT, "documents", "files");
  // deleteDatabaseHandler: Database = new Database(DatabaseUser.EXSTINGUET, "documents", "files");
  // updateDatabaseHandler: Database = new Database(DatabaseUser.REPONIT, "documents", "files");

  @Get("{fileId}")
  public async getFile(@Path() fileId: string, @Query() userId: string) {
    const file = (await this.readDatabaseHandler.getFile(fileId, userId)) as Buffer;
    return Readable.from(file);
  }

  @Get("")
  public async getAllFiles(@Query() userId: string) {
    return await this.readDatabaseHandler.getAllFiles(userId);
  }

  @Post("upload")
  public async uploadFile(@Request() request: express.Request) {
    const multerSingle = multer().single("file");
    await new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      multerSingle(request, undefined, async (error) => {
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
        this.userId,
        this.parentId
      );
    }

    return;
    // file will be in request.randomFileIsHere, it is a buffer
  }
}
