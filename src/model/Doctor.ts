import { ObjectId } from "mongodb";

export class Doctor {
  id: ObjectId;
  name: string;
  street: string;
  plz: number;
  city: string;

  constructor(id: ObjectId, name: string, street: string, plz: number, city: string) {
    this.id = new ObjectId(id);
    this.name = name;
    this.street = street;
    this.plz = plz;
    this.city = city;
  }
}
