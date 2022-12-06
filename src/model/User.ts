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
