import { Controller, Example, Get, Path, Query, Route } from "tsoa";
import { File } from "../model/File";
import { FilePermission } from "../model/FilePermission";
import { Permission } from "../model/Permission";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";

@Route("files")
export class FileController extends Controller {
  @Example<File>({
                   id: "6371fe0803b918f1869cb865",
                   name: "Demo Document",
                   parentId: "9371fe0803b918f1869cb865",
                   content: {},
                   ownerId: "5371fe0803b918f1869cb865",
                   users: [
                     new Permission("3371fe0803b918f1869cb865",
                                    FilePermission.Delete
                     )
                   ],
                   addUserPermission(): void {
                     return;
                   }
                 })

  readDatabaseHandler: Database = new Database(DatabaseUser.LEGET, "documents", "files");
  writeDatabaseHandler: Database = new Database(DatabaseUser.SCRIBIT, "documents", "files");
  deleteDatabaseHandler: Database = new Database(DatabaseUser.EXSTINGUET, "documents", "files");
  updateDatabaseHandler: Database = new Database(DatabaseUser.REPONIT, "documents", "files");


  @Get("{fileId}")
  public async getFile(@Path() fileId: string, @Query() userId: string) {
    const data = await this.readDatabaseHandler.getFile(fileId, userId);

    return data;
  }


}
