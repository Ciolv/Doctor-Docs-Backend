import { Controller, Example, Get, Route } from "tsoa";
import { File } from "../model/File";

@Route("files")
export class FileController extends Controller {
  @Example<File>({
    id: "52907745-7672-470e-a803-a2f8feb52944",
    name: "Demo Document",
    parent: "2c61ea7b-76d2-4d55-b8e2-cb4dcc1d229d",
    content: {},
  })
  @Get("")
  public async getFile() {
    return "success";
  }
}
