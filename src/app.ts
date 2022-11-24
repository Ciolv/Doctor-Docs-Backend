// src/app.ts
import express, { json, Request, Response, urlencoded } from "express";
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

export const app = express();

// Use body parser to read sent json payloads
app.use(
  urlencoded({
               extended: true
             })
);

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(json());

app.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(await import("../build/swagger.json")));
});

RegisterRoutes(app);
