import {
  isCityName,
  isFirstName,
  isInsuranceName,
  isInsuranceNumber,
  isLastName,
  isPostcode, isStreetName, isStreetNumber
} from "../../utils/Validation";


describe("Input validation", () => {
  test("Invalid insurance number fails", () => {
    const invalidInsuranceNumbers = ["", "S1234586789999", "N161038256"];
    for (const invalidInsuranceNumber of invalidInsuranceNumbers) {
      expect(isInsuranceNumber(invalidInsuranceNumber)).not.toBe(true);
    }
  });

  test("Valid insurance number succeeds", () => {
    const validInsuranceNumbers = [
      "N161038257",
      "N261038258",
      "N361038259",
      "N461038250",
      "N561038251",
      "N661038252",
      "N761038253",
      "N861038254",
      "N961038255",
    ];
    for (const validInsuranceNumbersKey of validInsuranceNumbers) {
      expect(isInsuranceNumber(validInsuranceNumbersKey)).toBe(true);
    }
  });

  test("Invalid insurance name fails", () => {
    const invalidInsuranceNames = ["", "abc?", "A", "a\\", "A_B"];
    for (const invalidInsuranceName of invalidInsuranceNames) {
      expect(isInsuranceName(invalidInsuranceName)).not.toBe(true);
    }
  });

  test("Valid insurance name succeeds", () => {
    const invalidInsuranceNames = [
      "BARMER",
      "DAK Gesundheit",
      "HEK - Hanseatische Krankenkasse",
      "hkk Krankenkasse",
      "KKH Kaufmännische Krankenkasse",
      "KNAPPSCHAFT",
      "Techniker Krankenkasse (TK)",
      "BIG direkt gesund",
      "IKK - Die Innovationskasse",
      "IKK Brandenburg und Berlin",
      "IKK classic",
      "IKK gesund plus",
      "IKK Südwest",
      "AOK Baden-Württemberg",
      "AOK Bayern",
      "AOK Bremen/Bremerhaven",
      "AOK Hessen",
      "AOK Niedersachsen",
      "AOK Nordost",
      "AOK Nordwest",
      "AOK PLUS",
      "AOK Rheinland-Pfalz/Saarland",
      "AOK Rheinland/Hamburg",
      "AOK Sachsen-Anhalt",
      "Audi BKK",
      "BAHN-BKK",
      "BERGISCHE Krankenkasse",
      "Bertelsmann BKK",
      "BKK Akzo Nobel Bayern",
      "BKK Diakonie",
      "BKK DürkoppAdler",
      "BKK EUREGIO",
      "BKK exklusiv",
      "BKK Faber-Castell & Partner",
      "BKK firmus",
      "BKK Freudenberg",
      "BKK GILDEMEISTER SEIDENSTICKER",
      "BKK HERKULES",
      "BKK Linde",
      "bkk melitta hmr",
      "BKK PFAFF",
      "BKK Pfalz",
      "BKK ProVita",
      "BKK Public",
      "BKK SBH",
      "BKK Scheufelen",
      "BKK Technoform",
      "BKK Textilgruppe Hof",
      "BKK VBU",
      "BKK VDN",
      "BKK VerbundPlus",
      "BKK Werra-Meissner",
      "BKK WIRTSCHAFT & FINANZEN",
      "BKK ZF & Partner",
      "BKK24",
      "Bosch BKK",
      "Continentale BKK",
      "Debeka BKK",
      "energie-BKK",
      "Heimat Krankenkasse",
      "mhplus Krankenkasse",
      "Mobil Krankenkasse",
      "Novitas BKK",
      "pronova BKK",
      "R+V Betriebskrankenkasse",
      "Salus BKK",
      "SBK",
      "SECURVITA Krankenkasse",
      "SKD BKK",
      "TUI BKK",
      "VIACTIV Krankenkasse",
      "vivida bkk",
      "WMF BKK",
      "Landwirtschaftliche Krankenkasse - LKK",
      "BKK B. Braun Aesculap",
      "BKK BPW Bergische Achsen KG",
      "BKK Deutsche Bank AG",
      "BKK evm",
      "BKK EWE",
      "BKK Groz-Beckert",
      "BKK KARL MAYER",
      "BKK MAHLE",
      "BKK Merck",
      "BKK Miele",
      "BKK MTU",
      "BKK PwC",
      "BKK Rieker.Ricosta.Weisser",
      "BKK Salzgitter",
      "BKK Stadt Augsburg",
      "BKK Voralb HELLER*INDEX*LEUZE",
      "BKK Würth",
      "BMW BKK",
      "Ernst & Young BKK",
      "Koenig & Bauer BKK",
      "Krones BKK",
      "Mercedes-Benz BKK",
      "Südzucker-BKK",
      "BIG direkt gesund",
      "vivida bkk",
      "VIACTIV",
      "BKK24",
      "BKK Aesculap",
      "DAK Gesundheit",
      "BKK VBU",
      "DAK Gesundheit",
      "BKK Gildemeister Seidensticker",
      "pronova BKK",
      "BKK VBU",
      "BARMER",
      "BKK ProVita",
      "BKK VBU",
      "DAK Gesundheit",
      "BKK GRILLO-WERKE AG",
      "actimonda",
      "Continentale BKK",
      "BKK VerbundPlus",
      "Audi BKK",
      "BKK VBU",
      "BKK Melitta HMR",
      "Metzinger BKK",
      "Novitas BKK",
      "energie BKK",
      "BKK VBU",
      "BKK ProVita",
      "BKK Pfalz",
      "BKK VBU",
      "BARMER",
      "energie-BKK",
      "Novitas BKK",
      "Linde BKK",
      "BKK Mobil Oil",
      "mhplus",
      "SAINT-GOBAIN BKK",
      "vivida bkk",
      "DAK Gesundheit",
      "Novitas BKK",
      "TBK (Thüringer Betriebskrankenkasse)",
      "pronova BKK",
      "BKK VBU",
      "BKK Verbund Plus",
    ];
    for (const invalidInsuranceName of invalidInsuranceNames) {
      expect(isInsuranceName(invalidInsuranceName)).toBe(true);
    }
  });

  test("Invalid city name fails", () => {
    const invalidCityNames = ["Graben-Neudorf 123", "Haus & Hof", "Krumbach*", "kleinstadt", "Krumbach+", "A_B", "123"];
    for (const invalidCityName of invalidCityNames) {
      expect(isCityName(invalidCityName)).not.toBe(true);
    }
  });

  test("Valid city name succeeds", () => {
    const validCityNames = [
      "Krumbach (Schwaben)",
      "Neustadt (Hessen)",
      "Neustadt in Holstein",
      "Pößneck",
      "Pausa-Mühltroff",
      "Saalfeld/Saale",
      "Rothenburg/Oberlausitz",
      "Reichenbach im Vogtland",
      "Pfaffenhofen an der Ilm",
      "Paderborn",
      "Neu-Anspach",
      "Naunhof",
      "Mühlheim an der Donau",
      "Kelbra asdf (Kyffhäuser)",
      "Königstein (Sächsische Schweiz)",
      "Buckow (Märkische Schweiz)",
      "Auerbach/Vogtl.",
      "St. Blasien",
      "Ammerbach (St. Anton)",
    ];
    for (const validCityName of validCityNames) {
      expect(isCityName(validCityName)).toBe(true);
    }
  });

  test("Invalid postcode fails", () => {
    const invalidPostcodes = ["A1234", "1234", "123456", "1234*"];
    for (const invalidPostcode of invalidPostcodes) {
      expect(isPostcode(invalidPostcode)).not.toBe(true);
    }
  });

  test("Valid postcode succeeds", () => {
    const validPostcodes = [
      "52231",
      "01001",
      "09107",
      "10099",
      "11011",
      "44128",
      "50656",
      "55100",
      "80313",
      "80788",
      "90329",
    ];
    for (const validPostcode of validPostcodes) {
      expect(isPostcode(validPostcode)).toBe(true);
    }
  });

  test("Invalid street number fails", () => {
    const invalidStreetNumbers = ["12 ß", "0", "b", "0a", "00a", "a a", "00 a", "13àâäèéêë", "1+a"];
    for (const invalidStreetNumber of invalidStreetNumbers) {
      expect(isStreetNumber(invalidStreetNumber)).not.toBe(true);
    }
  });

  test("Valid street number succeeds", () => {
    const validStreetNumbers = [
      "23a/2/3",
      "1 WH 5B 241",
      "25",
      "25 a",
      "25b",
      "25-ab",
      "12-14",
      "1",
      "9",
      "21",
      "1a",
      "121 b",
      "25A",
      "25 a",
    ];
    for (const validStreetNumber of validStreetNumbers) {
      expect(isStreetNumber(validStreetNumber)).toBe(true);
    }
  });

  test("Invalid street name fails", () => {
    const invalidStreetNames = ["Abc/7", "QwArK", "Q 7 A 7", "Q 7 a 7", ""];
    for (const invalidStreetName of invalidStreetNames) {
      expect(isStreetName(invalidStreetName)).not.toBe(true);
    }
  });

  test("Valid street name succeeds", () => {
    const validStreetNames = [
      "Hauptstraße",
      "Haputstr.",
      "Angeltürner Straße",
      "Robert-Bosch-Straße",
      "Albert-Schweitzer-Straße",
      "Königsberger Straße",
      "Kastanienweg",
      "Fasanenweg",
      "Am Bahnhof",
      "Postatraße",
      "Ölmühle",
      "Grünkern-Radweg",
      "LT 19",
      "Q7",
      "P1",
      "St. Anton Weg",
      "Q 7",
    ];
    for (const validStreetName of validStreetNames) {
      expect(isStreetName(validStreetName)).toBe(true);
    }
  });

  test("Invalid fist name fails", () => {
    const invalidFirstNames = ["A", "a", "Prinz Philipp der2.", "McGough", "Anna & Anton"];
    for (const invalidFirstName of invalidFirstNames) {
      expect(isFirstName(invalidFirstName)).not.toBe(true);
    }
  });

  test("Valid first name succeeds", () => {
    const validFirstNames = [
      "Aa",
      "Jonas",
      "Roman",
      "Yannic",
      "Jean-Luc",
      "André",
      "Prinz Philipp der Zweite",
      "Prinz Philipp der 2.",
      "Prinz Philipp der II",
    ];
    for (const validFirstName of validFirstNames) {
      expect(isFirstName(validFirstName)).toBe(true);
    }
  });

  test("Invalid fist name fails", () => {
    const invalidLastNames = ["A", "a", "Prinz Philipp der2.", "Prinz Philipp der 2.", "Anna & Anton"];
    for (const invalidLastName of invalidLastNames) {
      expect(isLastName(invalidLastName)).not.toBe(true);
    }
  });

  test("Valid last name succeeds", () => {
    const validLastNames = [
      "Aa",
      "McGough",
      "Müller",
      "Schmidt",
      "Schneider",
      "Schröder",
      "Neumann",
      "König",
      "Groß",
      "Doppel-Name",
      "von der Lippe",
      "Von McGough",
    ];
    for (const validLastName of validLastNames) {
      expect(isLastName(validLastName)).toBe(true);
    }
  });
});
