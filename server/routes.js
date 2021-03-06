const os = require('os');
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const Registry = require('../models/Registry');
const logger = require('../models/Logger');
const {NODE_ENV} = require('../config');
const _ = require('underscore');

module.exports = (params) => {
  const {config} = params;

  /**
   * Check the API key was sent and is valid
   * @param  {object} req
   * @return {boolean} true if API key is set and valid
   */
  function validKey(req) {
    const key = req.header('X-API-Key');
    return key !== '' && key === config.key;
  }

  /**
   * @param  {object} req Request
   * @return {string} IP address
   */
  function getIp(req) {
    if (NODE_ENV !== 'production' ) {
      return req.connection.remoteAddress;
    }

    let ip;
    try {
      if (req.headers && req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'] !== '') {
        // eslint-disable-next-line max-len
        ip = (req.headers['x-forwarded-for'].indexOf(',') === -1) ? _.trim(req.headers['x-forwarded-for']) : _.trim(req.headers['x-forwarded-for'].split(',')[0]);
      }
    } catch (e) {
      logger.error('possibly failed to get IP. ', e.message);
      ip = (req.ip && req.ip !== '') ? _.trim(req.ip) : '';
    }
    return ip;
  }

  router.use((req, res, next) => {
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.set('X-Whom', os.hostname());
    next();
  });

  // log all access. This most likely can be turned off as the logs will be huge
  router.use((req, res, next) => {
    const ip = getIp(req);
    // eslint-disable-next-line max-len
    logger.log(`${req.url} from: ${ip} ref: ${req.get('Referer')} via: ${req.get('User-Agent')}`);
    next();
  });

  router.get('/', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`loadbalancer ${config.version}`);
  });

  // server sending us their load info { key, server, cores, available (cores) }
  router.put('/register/:name/:cpus/:rooms/:version', (req, res) => {
    if (validKey(req)) {
      const {name, cpus, rooms, version} = req.params;
      Registry.register(name, cpus, rooms, version);
      res.json({status: 'ok', message: `Registered ${name}`});
    } else {
      res.status(400).json({status: 'error', message: 'Not allowed'});
    }
  });

  // chat server unregistering
  router.delete('/register/:name', (req, res) => {
    if (validKey(req)) {
      const name = req.params.name;
      Registry.unregister(name);
      res.json({status: 'ok', message: `Unregistered ${name}`});
    } else {
      res.status(400).json({status: 'error', message: 'Not allowed'});
    }
  });

  // return the least loaded (server with more capacity) for a certain app version
  router.get('/find/:version', async (req, res) => {
    if (validKey(req)) {
      const version = req.params.version;
      const server = await Registry.getLeastLoaded(version);
      res.json({status: 'ok', message: server});
    } else {
      res.status(400).json({status: 'error', message: 'Not allowed'});
    }
  });

  router.get('/info/:format', (req, res) => {
    const format = req.params.format;

    if (validKey(req)) {
      if (format === 'json') {
        res.json({status: 'ok', message: Registry.get()});
      } else {
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send(Registry.getFormatted());
      }
    } else {
      res.status(400).json({status: 'error', message: 'Not allowed'});
    }
  });

  router.use((error, req, res, next) => {
    res.status(error.status || 500);
    logger.log(error);
    return res.json({status: 'error', message: error.message});
  });

  return router;
};

