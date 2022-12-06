import { Body, Controller, Example, Get, Path, Post, Route } from "tsoa";
import { Patient } from "../model/Patient";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";

@Route("users")
export class PatientController extends Controller {
  readDatabaseHandler: Database = new Database(DatabaseUser.LEGET, "accounts", "users");
  writeDatabaseHandler: Database = new Database(DatabaseUser.SCRIBIT, "accounts", "users");
  // deleteDatabaseHandler: Database = new Database(DatabaseUser.EXSTINGUET, "accounts", "users");
  updateDatabaseHandler: Database = new Database(DatabaseUser.REPONIT, "accounts", "users");

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
  @Get("{userId}")
  public async getData(@Path() userId: string) {
    return await this.readDatabaseHandler.getUser(userId);
  }

  @Get("registrationCompleted/{userId}")
  public async userRegistrationCompleted(@Path() userId: string) {
    const user = await this.readDatabaseHandler.getUser(userId);
    if (user === null) {
      return { completed: false };
    }

    const allFieldsSet =
      user.city !== null &&
      user.first_name !== null &&
      user.last_name !== null &&
      user.insurance !== null &&
      user.insurance_number !== null &&
      user.postcode !== null &&
      user.street !== null &&
      user.number !== null &&
      user.id !== null;

    if (allFieldsSet) {
      return { completed: true };
    }

    return { completed: false };
  }

  @Post("registration")
  public async userRegistration(@Body() requestBody: Patient) {
    return await this.writeDatabaseHandler.updateUser(requestBody);
  }
}
