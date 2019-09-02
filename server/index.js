// loadbalancer app listens for load data from edges.
// Edges send data every x secs
// handles request for least loaded based on data from edges

const {NODE_ENV, KEY, PORT} = require('../config');
const pkg = require('../package.json');
const logger = require('../models/Logger');
const config = {
  version: pkg.version,
  key: KEY,
};
const msg = `${pkg.name} ${config.version} is starting in ${NODE_ENV} mode...`;
logger.log(msg);

// const fs = require('fs');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
// const nocache = require('nocache');
const routes = require('./routes');
const Registry = require('../models/Registry');

const app = express();

// set up SSL
// let key;
// let cert;
// let dh;

// try {
//   key = fs.readFileSync('./keys/local.key');
//   cert = fs.readFileSync('./keys/local.cert');
//   // Diffie–Hellman, stronger 2048 bit key for key exchange
//   // dh = fs.readFileSync('./keys/local-dh.pem');
// } catch (err) {
//   logger.log(`Failed to load key or certificate for SSL: ${err.message}`);
//   // if logging to splunk we need to wait before exiting
//   setTimeout(() => {
//     process.exit(1);
//   }, 2000);
// }

let interval;

app.use(bodyParser.urlencoded({extended: true}));
// app.use(nocache());
app.disable('x-powered-by');
app.use('/', routes({config}));

const server = http.createServer(app).listen(PORT, function() {
  logger.log(`${pkg.name} listening at http://0.0.0.0:${this.address().port}`);

  interval = setInterval(() => {
    Registry.cleanup();
  }, 30000);
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

