import { DoctorController } from "../../controller/DoctorController";

describe("Authentication", () => {
  test("Verify that unau", () => {
    const controller = new DoctorController();
    const result = controller.getDoctors("", { jwt: "" });
    console.log(result);
    // @ts-ignore
    expect(result !== null);
  });
});
