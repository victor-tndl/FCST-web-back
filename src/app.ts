import "reflect-metadata";
import Logger from "./services/Logger";
import { Server } from './services/Server';

// Start the app
const server = new Server();
server.start().then( () => {
  Logger.debug(`The server has started`);
});

// Catch Ctrl+C and properly stop the app
process.on('SIGINT', () => {
  Logger.debug('SIGINT (Ctrl+C) received. Stopping emploidut.')
  server.stop().then( () => {
    process.exit();
  })
})
