import { DoctorController } from "../../controller/DoctorController";
import { FileController } from "../../controller/FileController";
import { UserController } from "../../controller/UserController";
import { Readable } from "stream";

let doctorController: DoctorController;
let fileController: FileController;
let userController: UserController;
beforeAll(() => {
  doctorController = new DoctorController();
  fileController = new FileController();
  userController = new UserController();
});

describe("Authentication", () => {
  test("Verify geDoctors requires authentication", async () => {
    const result = await doctorController.getDoctors("", { jwt: "" });
    expect(result === "Unauthenticated");
  });

  test("Verify getDoctorData requires authentication", async () => {
    const result = await doctorController.getDoctorData({ jwt: "" }, "");
    expect(result === "Unauthenticated");
  });

  test("Verify getFile requires authentication", async () => {
    const result = await fileController.getFile("", { jwt: "" });
    expect(result === "Unauthenticated");
  });

  test("Verify getAllFiles requires authentication", async () => {
    const result = await fileController.getAllFiles({ jwt: "" });
    expect(result === "Unauthenticated");
  });

  test("Verify setMark requires authentication", async () => {
    const result = await fileController.setMark("", true, { jwt: "" });
    expect(result === "Unauthenticated");
  });

  test("Verify delete requires authentication", async () => {
    const result = await fileController.delete("", { jwt: "" });
    expect(result === "Unauthenticated");
  });

  test("Verify permit requires authentication", async () => {
    const result = await fileController.permit("", { action: "ADD", role: "DOCTOR", userId: "", jwt: "" });
    expect(result === "Unauthenticated");
  });

  test("Verify uploadFile requires authentication", async () => {
    const result = await fileController.uploadFile("", {
      buffer: Buffer.from(""),
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "",
      originalname: "",
      path: "",
      size: 0,
      stream: new Readable(),
    });
    expect(result === "Unauthenticated");
  });

  test("Verify getData requires authentication", async () => {
    const result = await userController.getData({ jwt: "" });
    expect(result === "Unauthenticated");
  });

  test("Verify searchForInsNumber requires authentication", async () => {
    const result = await userController.searchForInsNumber("", { jwt: "" });
    expect(result === "Unauthenticated");
  });

  test("Verify userRegistrationCompleted requires authentication", async () => {
    const result = await userController.userRegistrationCompleted({ jwt: "" });
    expect(result === "Unauthenticated");
  });
});
