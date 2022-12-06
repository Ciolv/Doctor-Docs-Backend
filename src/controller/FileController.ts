import { Controller, Example, Get, Path, Post, Query, Request, Route } from "tsoa";
import { File } from "../model/File";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import express from "express";
import multer from "multer";
import { Readable } from "stream";
import { ObjectId } from "mongodb";

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

  @Get("{fileId}")
  public async getFile(@Path() fileId: string, @Query() userId: string) {
    const response = (await this.readDatabaseHandler.getFile(fileId, userId)
    );
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
  public async setMark(@Path() fileId: string, @Query() value: boolean) {
    return await this.updateDatabaseHandler.updateFile({ _id: new ObjectId(fileId) }, { $set: { marked: value } });
  }

  @Get("/delete/{fileId}")
  public async delete(@Path() fileId: string) {
    return await this.deleteDatabaseHandler.deleteData({ _id: new ObjectId(fileId) });
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
