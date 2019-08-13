const {LOG4JS_LEVEL, LOG4JS_FILENAME, LOG4JS_CATEGORY, LOG4JS_MAXLOGSIZE,
  LOG4JS_BACKUPS, SPLUNK_TOKEN, SPLUNK_URL} = require('../config');

/**
 * LogStrategy to use. Can be log4js for writing to a local file,
 *  splunk to send log data on an instance(s) of splunk,
 *  to console, or none
 */
class LogStrategy {
  /**
  * initialize the Singleton LogStrategy
  */
  constructor() {
    this.logger = null;
    this.strategy = 'none';
  }

  /**
  * Sets the logging strategy
  * @param {string} strategy Selected strategy for logging.
  * @return {object} The static logger method to be used
  */
  setStrategy(strategy) {
    this.strategy = strategy;
    return this._init();
  }

  /**
   * getStrategy
   * @return {string} The chosen logging strategy
   */
  getStrategy() {
    return this.strategy;
  }

  /**
  * Private initializer for the selected strategy.
  * NOTE: Options must be passed in as ENV vars. See env.example file
  * @return {object}
  */
  _init() {
    if (this.logger !== null) {
      this.logger = null;
    }

    switch (this.strategy) {
      case 'log4js':
        const log4js = require('log4js');
        const level = LOG4JS_LEVEL;
        const filename = LOG4JS_FILENAME;
        const category = LOG4JS_CATEGORY;
        const maxLogSize = LOG4JS_MAXLOGSIZE;
        const backups = LOG4JS_BACKUPS;

        log4js.configure({
          appenders: {
            out: {type: 'stdout'},
            app: {
              type: 'file',
              filename: filename,
              category: category,
              maxLogSize: maxLogSize,
              backups: backups,
            },
          },
          categories: {
            default: {appenders: ['out', 'app'], level: level},
          },
        });
        this.logger = log4js.getLogger(category);
        return this._toLog4j.bind(this);
        break;

      case 'splunk':
        if (!SPLUNK_TOKEN || !SPLUNK_URL) {
          throw Error('Splunk requires ENV config options for token/url');
        }

        const SplunkLogger = require('splunk-logging').Logger;
        const config = {
          token: SPLUNK_TOKEN,
          url: SPLUNK_URL,
        };
        this.logger = new SplunkLogger(config);
        return this._toSplunk.bind(this);
        break;

      case 'none':
        break;

      default:
        return this._toConsole;
    }
  }

  /**
   * @param  {string} message
   */
  _toLog4j(message) {
    this.logger.info(message);
  }

  /**
   * @param {string} message
   */
  _toSplunk(message) {
    this.logger.send({message: message}, (err, resp, body) => {
      // If successful, body will be { text: 'Success', code: 0 }
      // console.log('Response from Splunk', body);
    });
  }

  /**
  * toConsole logs to console
  * @param {string} message
  */
  _toConsole(message) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${message}`);
  }

  /**
  * No logging
  * @param {string} message
  */
  _none(message) {
  }
}

module.exports = new LogStrategy(); // Singleton
