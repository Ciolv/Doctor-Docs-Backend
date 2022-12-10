export function isInsuranceName(value: string) {
  const regexp = /^[A-Za-zÄÖÜäöüÊÉÈêéèÔÓÒôóòÛÚÙûúùß)&*+./(\- 0-9]{2,}$/;
  return regexp.test(value);
}

export function isCityName(value: string) {
  const regexp =
    /^[A-ZÄÖÜÊÉÈÔÓÒÛÚÙ][a-zäöüêéèôóòûúùß.]+(?:[ -/][A-ZÄÖÜÊÉÈÔÓÒÛÚÙ]?[a-zäöüêéèôóòûúùß.]+)*(?: \([A-ZÄÖÜÊÉÈÔÓÒÛÚÙ][a-zäöüêéèôóòûúùß.]+(?:[ -][A-ZÄÖÜÊÉÈÔÓÒÛÚÙ]?[a-zäöüêéèôóòûúùß.]+)*\))*$/;
  return regexp.test(value);
}

export function isPostcode(value: string) {
  const regexp = /^\d{5}$/;
  return regexp.test(value);
}

export function isStreetNumber(value: string) {
  const regexp = /^[1-9][0-9]*(?:\w|\/|-| )*$/;
  return regexp.test(value);
}

export function isStreetName(value: string) {
  const regexp = /^[A-ZÄÖÜÊÉÈÔÓÒÛÚÙ]+[a-zäöüêéèôóòûúùß.]*(?:(?: |-)?|[A-ZÄÖÜÊÉÈÔÓÒÛÚÙ]?[a-zäöüêéèôóòûúùß.]+)*\d*$/;
  return regexp.test(value);
}

export function isFirstName(value: string) {
  const regexp = /^[A-ZÄÖÜÊÉÈÔÓÒÛÚÙ][a-zäöüêéèôóòûúùß-]+(?:(?: |-)[A-ZÄÖÜÊÉÈÔÓÒÛÚÙ]*[a-zäöüêéèôóòûúùß-]+)*( \d+\.| [A-Z]+\.?)*$/;
  return regexp.test(value);
}

export function isLastName(value: string) {
  const regexp = /^(?:[A-ZÄÖÜÊÉÈÔÓÒÛÚÙ]?[A-ZÄÖÜÊÉÈÔÓÒÛÚÙa-zäöüêéèôóòûúùß-]){2,}(?:(?: |-)[A-ZÄÖÜÊÉÈÔÓÒÛÚÙa-zäöüêéèôóòûúùß]+-?)*$/;
  return regexp.test(value);
}

export function isInsuranceNumber(value: string) {
  if (value.length === 10) {
    const regex = /^([A-Z])([0-9]{8})([0-9])$/;
    const match = regex.exec(value);
    if (match) {
      const cardNo = `0${match[1].charCodeAt(0) - 64}`.slice(-2) + match[2];
      let sum = 0;
      for (let i = 0; i < 10; i++) {
        // eslint-disable-next-line security/detect-object-injection
        let digit = Number(cardNo[i]);
        if (i % 2 === 1) {
          digit *= 2;
        }
        if (digit > 9) {
          digit -= 9;
        }
        sum += digit;
      }
      if (sum % 10 === Number(match[3])) {
        return true;
      }
    }
  }

  return false;
}