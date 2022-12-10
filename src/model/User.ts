import { EncryptionResult } from "../utils/encryption";

export class User {
  id: string;
  first_name: EncryptionResult | string;
  last_name: EncryptionResult | string;
  street: EncryptionResult | string;
  number: EncryptionResult | string;
  postcode: EncryptionResult | string;
  city: EncryptionResult | string;
  insurance_number?: string;
  insurance?: EncryptionResult | string;
  approbation?: string;
  verified? = false;

  constructor(
    first_name: EncryptionResult | string,
    last_name: EncryptionResult | string,
    street: EncryptionResult | string,
    number: EncryptionResult | string,
    postcode: EncryptionResult | string,
    city: EncryptionResult | string,
    insurance_number?: string,
    insurance?: EncryptionResult | string,
    approbation?: string,
    verified?: boolean,
    id?: string
  ) {
    this.id = id ?? "";
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
