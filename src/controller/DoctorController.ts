import { Controller, Example, Get, Path, Route } from "tsoa";
import { Doctor } from "../model/Doctor";
import { Database } from "./Database";
import { DatabaseUser } from "../model/DatabaseUser";
import { ObjectId } from "mongodb";

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
    const doctors: Doctor[] = [];
    await db.getMany({ name: re }).then((result) => {
      result.forEach((element) => {
        const doctor: Doctor = new Doctor(
          element["id"],
          element["name"],
          element["street"],
          element["plz"],
          element["city"]
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
      doc2 = new Doctor(resp.id, resp.name, resp.street, resp.plz, resp.city);
      return doc2;
    }
    console.log("Else-Fall");
    this.setStatus(500);
    return "Invalid Query - No such userId.";
  }
}
