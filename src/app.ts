// src/app.ts
import express, { json, Request, Response, urlencoded } from "express";
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { config } from "dotenv";

export const app = express();

config();

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);

function getOriginArray() {
  const originString = process.env.CORS_ORIGINS;
  if (originString === undefined) {
    return [];
  }

  return originString.split(",");
}

const corsOptions = {
  origin: getOriginArray(),
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(json());

app.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(await import("../build/swagger.json")));
});

RegisterRoutes(app);
