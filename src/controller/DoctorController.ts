import { Body, Controller, Example, Path, Post, Route } from "tsoa";
import { Doctor } from "../model/Doctor";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import { ObjectId } from "mongodb";
import { User } from "../model/User";
import { AuthenticationBody } from "../model/Authentication";
import { getUserId } from "../utils/AuthenticationHelper";
import { Logger } from "../utils/Log";

@Route("doctors")
export class DoctorController extends Controller {
  @Example<Doctor>({
    id: new ObjectId(12),
    name: "Dr. med. Jonas Fabian Pohle",
    street: "Haardtstraße 16",
    plz: 68163,
    city: "Mannheim",
  })
  @Post("{searchTerm}")
  public async getDoctors(@Path() searchTerm: string, @Body() body: AuthenticationBody) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warn(`Unauthenticated user tried to search for a doctor with searchterm '${searchTerm}'`);
        this.setStatus(403);
        return "Unauthenticated";
      }

      const re = new RegExp(`\\w*${searchTerm}\\w*`);
      const db: Database = new Database(DatabaseUser.LEGET, "accounts", "doctors");
      const doctors: User[] = [];
      await db
        .getMany({
          $or: [{ first_name: re }, { last_name: re }, { street: re }, { city: re }],
        })
        .then((result) => {
          result.forEach((element) => {
            const doctor: User = new User(
              element["first_name"],
              element["last_name"],
              element["street"],
              element["number"],
              element["postcode"],
              element["city"],
              undefined,
              undefined,
              element["approbation"],
              element["verified"],
              element["id"]
            );
            doctors.push(doctor);
          });
        });
      this.setHeader("Access-Control-Allow-Origin", "*");
      return doctors;
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }

  @Post("/data/{doctorId}")
  public async getDoctorData(@Body() body: AuthenticationBody, @Path() doctorId: string) {
    try {
      const userId = await getUserId(body.jwt);
      if (userId === "") {
        Logger.warn(`Unauthenticated user tried to access doctor data for ${doctorId}`);
        this.setStatus(403);
        return "Unauthenticated";
      }
      const db: Database = new Database(DatabaseUser.LEGET, "accounts", "doctors");
      const resp = await db.getData({ id: doctorId });
      let doc2;
      if (resp !== null) {
        doc2 = new User(
          resp.first_name,
          resp.last_name,
          resp.street,
          resp.number,
          resp.postcode,
          resp.city,
          resp.insurance_number,
          resp.insurance,
          resp.approbation,
          resp.verified,
          resp.id
        );
        Logger.info(`User ${userId} requested date for doctor ${doctorId}`);
        return doc2;
      }

      this.setStatus(404);
      return "Invalid Query - No such userId.";
    } catch (e) {
      Logger.error(e);
      this.setStatus(500);
      return "Internal server error";
    }
  }
}
