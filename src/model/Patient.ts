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
  ) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.street = street;
    this.number = number;
    this.postcode = postcode;
    this.city = city;
    this.insurance_number = insurance_number;
    this.insurance = insurance;
  }
}
