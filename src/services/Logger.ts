import winston from 'winston';
import morgan, { StreamOptions } from "morgan";

// Define your severity level. 
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define color of each severity level 
const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
};

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Customize the format of logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} - ${info.level} - ${info.message}`,
  ),
);

// Define transports used 
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Define path to use to log messages
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger instance that has to be exported and used to log messages.
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

const stream: StreamOptions = {
    // Use the http severity
    write: (message) => Logger.http(message),
};

// Skip all the Morgan http log if the 
// application is not running in development mode.
// This method is not really needed here since 
// we already told to the logger that it should print
// only warning and error messages in production.
const skip = () => {
    const env = process.env.NODE_ENV || "development";
    return env !== "development";
};

// Build the morgan middleware
export const loggerMiddleware = morgan(
    ':remote-addr :method ":url HTTP/:http-version" :status :res[content-length]',
    { stream, skip }
);
  

export default Logger;
