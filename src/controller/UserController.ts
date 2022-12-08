import { Body, Controller, Path, Example, Post, Route } from "tsoa";
import { User } from "../model/User";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import { Filter } from "mongodb";
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
                   approbation: "Regierungspräsidium Stuttgart"
                 })
  @Post("")
  public async getData(@Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        this.setStatus(403);
        return;
      }

      let user = await this.readDatabaseHandler.getUser(userId);
      if (user === false) {
        user = await this.readDoctorDatabaseHandler.getUser(userId);
      }

      if (user === null) {
        this.setStatus(404);
        return "User not found";
      }

      this.setStatus(200);
      return user;
    } catch (e) {
      console.log(e);
      this.setStatus(500);
      return;
    }
  }

  @Post("/search/{insNumber}")
  public async searchForInsNumber(@Path() insNumber: string, @Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        this.setStatus(403);
        return;
      }

      const filter: Filter<User> = { insurance_number: insNumber };
      const result = await this.readDatabaseHandler.getData(filter);
      const userExists = result !== null;

      this.setStatus(200);
      return userExists;
    } catch (e) {
      console.log(e);
      this.setStatus(500);
      return;
    }
  }

  @Post("registrationCompleted")
  public async userRegistrationCompleted(@Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        this.setStatus(403);
        return;
      }

      let user = await this.readDatabaseHandler.getUser(userId);
      if (typeof user === "boolean") {
        user = await this.readDoctorDatabaseHandler.getUser(userId);
        if (typeof user === "boolean") {
          this.setStatus(200);
          return { completed: false };
        }
      }

      const allFieldsSet =
        user.city !== null &&
        user.first_name !== null &&
        user.last_name !== null &&
        user.insurance !== null &&
        ((user.insurance !== "" && user.insurance_number !== null && user.insurance_number !== ""
         ) ||
         user.approbation !== ""
        ) &&
        user.postcode !== null &&
        user.street !== null &&
        user.number !== null &&
        user.id !== null;

      if (allFieldsSet) {
        this.setStatus(200);
        return { completed: true };
      }

      this.setStatus(200);
      return { completed: false };
    } catch (e) {
      console.log(e);
      this.setStatus(500);
      return;
    }
  }

  @Post("registration")
  public async userRegistration(@Body() requestBody: User) {
    try {
      this.setStatus(200);
      if (requestBody.approbation === "") {
        return await this.writeDatabaseHandler.updateUser(requestBody);
      }
      return await this.writeDoctorDatabaseHandler.updateUser(requestBody);
    } catch (e) {
      console.log(e);
      this.setStatus(500);
      return;
    }
  }
}
