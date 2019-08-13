// loadbalancer app listens for load data from edges.
// Edges send data every x secs
// handles request for least loaded based on data from edges

const {NODE_ENV, KEY, PORT} = require('../config');
const logger = require('../models/Logger');
const config = {
  version: '2.0.0',
  key: KEY,
};
const msg = `Loadbalancer ${config.version} is starting in ${NODE_ENV} mode...`;
logger.log(msg);

const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const hidePoweredBy = require('hide-powered-by');
const nocache = require('nocache');
const routes = require('./routes');
const Registry = require('../models/Registry');

const app = express();

// set up SSL
let key;
let cert;
// let dh;

try {
  key = fs.readFileSync('./keys/local.key');
  cert = fs.readFileSync('./keys/local.cert');
  // Diffie–Hellman, stronger 2048 bit key for key exchange
  // dh = fs.readFileSync('./keys/local-dh.pem');
} catch (err) {
  logger.log(`Failed to load key or certificate for SSL: ${err.message}`);
  // if logging to splunk we need to wait before exiting
  setTimeout(() => {
    process.exit(1);
  }, 2000);
}

let server;
let interval;

// if we got a key and cert we can continue
if (key && cert) {
  const options = {
    key: key,
    cert: cert,
    // dhparam: dh,
  };

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(helmet());
  app.use(hidePoweredBy());
  app.use(nocache());
  app.use('/', routes({config}));

  server = https.createServer(options, app).listen(PORT, function() {
    logger.log(`App listening at https://0.0.0.0:${this.address().port}`);

    interval = setInterval(() => {
      Registry.cleanup();
    }, 30000);
  });
}

process.on('uncaughtException', (err, origin) => {
  logger.log(`uncaughtException: ${err}`);
});

process.on('SIGTERM', () => {
  logger.log('Received SIGTERM');

  clearInterval(interval);
  server.close(() => {
    process.exit(0);
  });
});


module.exports = {
  app,
  config,
};

