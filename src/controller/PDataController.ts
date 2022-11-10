import { Controller, Example, Get, Route } from "tsoa";
import { Patient } from "../model/PData";
import { Database } from "./Database";
import { User } from "../model/User";

@Route("data")
export class PDataController extends Controller {
  @Example<Patient>({
    id: "15d37d7a-bd45-49b4-b83c-bd3393c2ca91",
    first_name: "Gernot",
    last_name: "Hassknecht",
    street: "Ehrenfelder Straße",
    number: 7,
    postcode: 516915,
    city: "Köln",
    insurance: "BARMER",
    insurance_number: "N26815181181585138",
  })
  @Get("get")
  public async getData() {
    const db: Database = new Database(User.LEGET, "documents", "files");
    const data = (await db.getData({})) as Object;
    console.log(data);
    return JSON.stringify(data);
  }

  @Get("insert")
  public async insertData() {
    const db: Database = new Database(User.SCRIBIT, "documents", "files");
    const data = { content: "This is a simple test document." };
    const result = await db.insertData(data);
    console.log(result);
    return String(result);
  }
}
