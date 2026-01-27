import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

const { combine, timestamp, errors, printf, colorize } = winston.format;

/**
 * Custom log format
 */
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return `${timestamp} [${level}]: ${stack || message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

/**
 * File rotation transport
 */
const fileRotateTransport = new DailyRotateFile({
  dirname: logDir,
  filename: "%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

/**
 * Error-only file
 */
const errorFileRotateTransport = new DailyRotateFile({
  dirname: logDir,
  filename: "%DATE%-error.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  level: "error",
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [fileRotateTransport, errorFileRotateTransport],
});

/**
 * Console logging
 */
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), logFormat),
    }),
  );
}
