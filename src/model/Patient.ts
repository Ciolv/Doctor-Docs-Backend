export class Patient {
  id = "";
  first_name: string;
  last_name: string;
  street: string;
  number: number;
  postcode: number;
  city: string;
  insurance_number: string;
  insurance: string;

  constructor(
    first_name: string,
    last_name: string,
    street: string,
    number: number,
    postcode: number,
    city: string,
    insurance_number: string,
    insurance: string
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
