import { createLogger, format, transports } from 'winston';
import dayjs from 'dayjs';
import chalk from 'chalk'; 

const customTimestamp = format((info) => {
  info.timestamp = dayjs().format('DD-MM-YYYY hh:mm:ss A'); 
  return info;
});


const logger = createLogger({
  level: 'info',
  format: format.combine(
    customTimestamp(),
    format.printf(({ timestamp, level, message }) => {
    
      const colorLevel = level === 'error' ? chalk.red(level) : 
                         level === 'warn' ? chalk.yellow(level) : 
                         chalk.green(level);
      return `${timestamp} [${colorLevel}]: ${chalk.cyan(message)}`; // Apply color to the message
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message }) => {
          const colorLevel = level === 'error' ? chalk.red(level) : 
                             level === 'warn' ? chalk.yellow(level) : 
                             chalk.green(level);
          return `${timestamp} [${colorLevel}]: ${chalk.cyan(message)}`;
        })
      )
    }),
    new transports.File({
      filename: 'logs/app.log',
      format: format.combine(
        format.uncolorize(),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message} \n`)
      )
    })
  ]
});

export default logger;
