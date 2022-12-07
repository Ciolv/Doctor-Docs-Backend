import { Body, Controller, Example, Post, Route } from "tsoa";
import { User } from "../model/User";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import { AuthenticationBody } from "../model/Authentication";
import { getUserId } from "../utils/AuthenticationHelper";

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
  @Post("")
  public async getData(@Body() body: AuthenticationBody) {
    const userId = await getUserId(body.jwt);
    if (userId === "") {
      return null;
    }
    const user = await this.readDatabaseHandler.getUser(userId);
    if (user !== false) {
      return user;
    }
    const doctor = await this.readDoctorDatabaseHandler.getUser(userId);
    return doctor;
  }

  @Post("registrationCompleted")
  public async userRegistrationCompleted(@Body() body: AuthenticationBody) {
    const userId = await getUserId(body.jwt);
    if (userId === "") {
      return null;
    }
    let user = await this.readDatabaseHandler.getUser(userId);
    if (typeof user === "boolean") {
      user = await this.readDoctorDatabaseHandler.getUser(userId);
      if (typeof user === "boolean") {
        return { completed: false };
      }
    }

    const allFieldsSet =
      user.city !== null &&
      user.first_name !== null &&
      user.last_name !== null &&
      user.insurance !== null &&
      ((user.insurance !== "" && user.insurance_number !== null && user.insurance_number !== "") ||
        user.approbation !== "") &&
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
  public async userRegistration(@Body() requestBody: User) {
    if (requestBody.approbation === "") {
      return await this.writeDatabaseHandler.updateUser(requestBody);
    }
    return await this.writeDoctorDatabaseHandler.updateUser(requestBody);
  }
}
