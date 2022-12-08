import { Body, Controller, Path, Example, Post, Route } from "tsoa";
import { User } from "../model/User";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import { Filter } from "mongodb";
import { AuthenticationBody } from "../model/Authentication";
import { getUserId } from "../utils/AuthenticationHelper";
import { Logger } from "../utils/Log";

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
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warning(`Unauthenticated user tried to fetch all user data`);
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

      Logger.info(`User ${userId} fetched own user data`);
      this.setStatus(200);
      return user;
    } catch (e) {
      console.log(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("/search/{insNumber}")
  public async searchForInsNumber(@Path() insNumber: string, @Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warning(`Unauthenticated user tried to search for insurance number ${insNumber}`);
        this.setStatus(403);
        return;
      }

      const filter: Filter<User> = { insurance_number: insNumber };
      const result = await this.readDatabaseHandler.getData(filter);
      const userExists = result !== null;

      Logger.info(`User ${userId} searched for insurance number ${insNumber}`);
      this.setStatus(200);
      return userExists;
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("registrationCompleted")
  public async userRegistrationCompleted(@Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warning(`Unauthenticated user tried to check registration status.`);
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
        ((user.insurance !== "" && user.insurance_number !== null && user.insurance_number !== "") ||
          user.approbation !== "") &&
        user.postcode !== null &&
        user.street !== null &&
        user.number !== null &&
        user.id !== null;

      if (allFieldsSet) {
        Logger.info(`User ${userId} registration is complete`);
        this.setStatus(200);
        return { completed: true };
      }

      Logger.info(`User ${userId} registration is incomplete`);
      this.setStatus(200);
      return { completed: false };
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("registration")
  public async userRegistration(@Body() requestBody: User) {
    try {
      this.setStatus(200);
      let userId;
      if (requestBody.approbation === "") {
        userId = await this.writeDatabaseHandler.updateUser(requestBody);
      } else {
        userId = await this.writeDoctorDatabaseHandler.updateUser(requestBody);
      }

      Logger.info(`New user ${userId} registered`);
      return userId;
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }
}
