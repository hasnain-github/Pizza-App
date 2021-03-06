/*
*
* Application file for user microservice
*
*/

// Dependencies
import https from 'https';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './controller/userRoutes';
import tokenRoute from './controller/tokenRoute';
import heartbeatRoute from './controller/heartbeatRoute';
import defaultRoute from './controller/defaultRoute';
import utilMiddlewares from './util/utilMiddlewares';
import register from './util/register';
import logger from './util/logger';
import {config} from 'config';

// Router and app object
const router = express.Router();
const app = express();

// Middleware to parse request body
app.use(bodyParser.json());

// Middleware to handle json parsing errors in request body
app.use(utilMiddlewares.catchParsingError());

// Routing to the middleware of '/users' route
app.use(userRoutes(router));

// Routing to the middleware of '/token' route
app.use(tokenRoute(router));

// Router to the middleware of /heartbeat
app.use(heartbeatRoute(router));

// Default error handling middleware
app.use(utilMiddlewares.defaultErrorHandler());

// Default routing middleware
app.use('*', defaultRoute(router));

// Start the HTTP server
app.listen(config.httpPort, () => {
  logger.info('HTTP server listening on port %s', config.httpPort);
  register.registerService('http',
                           config.httpPort,
                           config.consulInfo.registeredServiceNameHttp,
                           config.consulInfo.registeredServiceIdHttp);
});

// Start the HTTPS server
https.createServer({
  "key" : fs.readFileSync(config.keyFileLocation),
  "cert" : fs.readFileSync(config.certFileLocation)
}, app).listen(config.httpsPort, () => {
  logger.info('HTTPS server listening on port %s', config.httpsPort);
  register.registerService('https',
                            config.httpsPort,
                            config.consulInfo.registeredServiceNameHttps,
                            config.consulInfo.registeredServiceIdHttps);
});
