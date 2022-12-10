import { app } from "./app";
import * as https from "https";
import * as fs from "fs";

const port = process.env.PORT || 8080;

https.createServer({key: fs.readFileSync("security/key.pem"), cert: fs.readFileSync("security/cert.pem")}, app).listen(port, () => {
  console.log(`DoctorDocs-Backend listening at http://localhost:${port}`)
})

// app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
