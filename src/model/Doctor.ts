import { ObjectId } from "mongodb";

export class Doctor {
  id: ObjectId;
  name: string;
  street: string;
  plz: string;
  city: string;

  constructor(id: ObjectId, name: string, street: string, plz: string, city: string) {
    this.id = new ObjectId(id);
    this.name = name;
    this.street = street;
    this.plz = plz;
    this.city = city;
  }
}
