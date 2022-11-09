import { Controller, Example, Get, Route } from "tsoa";
import { Patient } from "../model/PData";
import { closeDB, connectDB, getDataDB } from "./Database";

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
  @Get("")
  public async getData() {
    connectDB().then((result) => {
      console.log(result);
      getDataDB("DoctorDocs", "patients").then((result) => console.log(result));
      closeDB();
    });
  }
}
