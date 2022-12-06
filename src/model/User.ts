<<<<<<< HEAD:src/model/User.ts
export class User {
  id: string;
  first_name: string;
  last_name: string;
  street: string;
  number: number;
  postcode: number;
  city: string;
  insurance_number?: string;
  insurance?: string;
  approbation?: string;
  verified? = false;

  constructor(
    first_name: string,
    last_name: string,
    street: string,
    number: number,
    postcode: number,
    city: string,
    insurance_number?: string,
    insurance?: string,
    approbation?: string,
    verified?: boolean,
    id?: string
=======
import { EncryptionResult } from "../utils/encryption";

export class Patient {
  id = "";
  first_name: EncryptionResult | string;
  last_name: EncryptionResult | string;
  street: EncryptionResult | string;
  number: EncryptionResult | number;
  postcode: EncryptionResult | number;
  city: EncryptionResult | string;
  insurance_number: string;
  insurance: EncryptionResult | string;

  constructor(
    first_name: EncryptionResult | string,
    last_name: EncryptionResult | string,
    street: EncryptionResult | string,
    number: EncryptionResult | number,
    postcode: EncryptionResult | number,
    city: EncryptionResult | string,
    insurance_number: string,
    insurance: EncryptionResult | string
>>>>>>> f14824b5395f4de2c7254a193023878b04dccb9b:src/model/Patient.ts
  ) {
    if (id) {
      this.id = id;
    } else {
      this.id = "";
    }
    this.first_name = first_name;
    this.last_name = last_name;
    this.street = street;
    this.number = number;
    this.postcode = postcode;
    this.city = city;
    this.insurance_number = insurance_number;
    this.insurance = insurance;
    this.approbation = approbation;
    this.verified = verified;
  }
}
