import { Body, Controller, Example, Get, Path, Post, Route } from "tsoa";
import { User } from "../model/User";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";

@Route("users")
export class UserController extends Controller {
  readDatabaseHandler: Database = new Database(DatabaseUser.LEGET, "accounts", "users");
  readDoctorDatabaseHandler: Database = new Database(DatabaseUser.LEGET, "accounts", "doctors");
  writeDatabaseHandler: Database = new Database(DatabaseUser.SCRIBIT, "accounts", "users");
  writeDoctorDatabaseHandler: Database = new Database(DatabaseUser.SCRIBIT, "accounts", "doctors");
  // deleteDatabaseHandler: Database = new Database(DatabaseUser.EXSTINGUET, "accounts", "users");
  updateDatabaseHandler: Database = new Database(DatabaseUser.REPONIT, "accounts", "users");

  @Example<User>({
    id: "15d37d7a-bd45-49b4-b83c-bd3393c2ca91",
    first_name: "Gernot",
    last_name: "Hassknecht",
    street: "Ehrenfelder Straße",
    number: 7,
    postcode: 516915,
    city: "Köln",
    insurance: "BARMER",
    insurance_number: "N26815181181585138",
    approbation: "Regierungspräsidium Stuttgart",
  })
  @Get("{userId}")
  public async getData(@Path() userId: string) {
    const user = await this.readDatabaseHandler.getUser(userId);
    if (user !== null) {
      return user;
    }
    return await this.readDoctorDatabaseHandler.getUser(userId);
  }

  @Get("registrationCompleted/{userId}")
  public async userRegistrationCompleted(@Path() userId: string) {
    let user = await this.readDatabaseHandler.getUser(userId);
    if (user === null) {
      user = await this.readDoctorDatabaseHandler.getUser(userId);
      if (user === null) {
        return { completed: false };
      }
    }

    const allFieldsSet =
      user.city !== null &&
      user.city !== "" &&
      user.first_name !== null &&
      user.first_name !== "" &&
      user.last_name !== null &&
      user.last_name !== "" &&
      user.insurance !== null &&
      ((user.insurance !== "" && user.insurance_number !== null && user.insurance_number !== "") ||
        user.approbation !== "") &&
      user.postcode !== null &&
      user.street !== null &&
      user.street !== "" &&
      user.number !== null &&
      user.id !== null &&
      user.id !== "";

    if (allFieldsSet) {
      return { completed: true };
    }

    return { completed: false };
  }

  @Post("registration")
  public async userRegistration(@Body() requestBody: User) {
    if (requestBody.approbation === "") {
      return await this.writeDatabaseHandler.updateUser(requestBody);
    }
    return await this.writeDoctorDatabaseHandler.updateUser(requestBody);
  }
}
