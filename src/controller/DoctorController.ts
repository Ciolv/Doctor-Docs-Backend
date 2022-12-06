import { Controller, Example, Get, Path, Route } from "tsoa";
import { Doctor } from "../model/Doctor";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import { ObjectId } from "mongodb";
import { User } from "../model/User";

@Route("doctors")
export class DoctorController extends Controller {
  @Example<Doctor>({
    id: new ObjectId(12),
    name: "Dr. med. Jonas Fabian Pohle",
    street: "Haardtstraße 16",
    plz: 68163,
    city: "Mannheim",
  })
  @Get("{searchTerm}")
  public async getDoctors(@Path() searchTerm: string) {
    const re = new RegExp(`\\w*${searchTerm}\\w*`);
    console.log(re);
    const db: Database = new Database(DatabaseUser.LEGET, "accounts", "doctors");
    const doctors: User[] = [];
    await db.getMany({ $or: [{ first_name: re }, { last_name: re }, { street: re }, { city: re }] }).then((result) => {
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
  }

  @Get("/data/{userId}")
  public async getDoctorData(@Path() userId: string) {
    const db: Database = new Database(DatabaseUser.LEGET, "accounts", "doctors");
    console.log(userId);
    const resp = await db.getData({ id: userId });
    let doc2;
    if (resp !== null) {
      doc2 = new User(
        resp.first_name,
        resp.last_name,
        resp.street,
        resp.number,
        resp.postcode,
        resp.city,
        undefined,
        undefined,
        resp.approbation,
        resp.verified,
        resp.id
      );
      return doc2;
    }
    console.log("Else-Fall");
    this.setStatus(500);
    return "Invalid Query - No such userId.";
  }
}
