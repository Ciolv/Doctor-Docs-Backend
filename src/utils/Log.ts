import winston from "winston";
import { config } from "dotenv";

config();

const logLevel = process.env.LOG_LEVEL?.toLowerCase() ?? "info";

const consoleTransport = new winston.transports.Console({ level: logLevel, format: winston.format.cli() });
const errorTransport = new winston.transports.File({ filename: "error.log", level: "error" });
const combinedTransport = new winston.transports.File({ filename: "combined.log" });


// Write all logs with log-level error to a dedicated file
// Write all log messages with the given log level or below, including errors, to a combined file.
export const Logger = winston.createLogger({
                                             level: logLevel,
                                             format: winston.format.json(),
                                             defaultMeta: { service: "Doctor-Docs-Backend" },
                                             transports: [
                                               consoleTransport,
                                               errorTransport,
                                               combinedTransport
                                             ]
                                           });


//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  Logger.remove(errorTransport);
  Logger.remove(combinedTransport);
}