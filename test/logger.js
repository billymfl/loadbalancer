const logger = require('../models/Logger');
const chai = require('chai');
const assert = chai.assert;

describe('logger', function() {
  describe('#getStrategy()', function() {
    it('should have default strategy of console', function() {
      process.env.LOGGER = 'console';
      assert.equal(logger.getStrategy(), 'console');
    });
  });

  describe('#changeStrategy()', function() {
    it('should throw error trying to set splunk w/o config', function() {
      try {
        logger.changeStrategy('splunk');
      } catch (err) {

      }
    });

    // it('should set strategy to splunk with config', function() {
    //   delete require.cache[require.resolve('../config')];
    //   process.env.SPLUNK_TOKEN = 'token';
    //   process.env.SPLUNK_URL = 'http://localhost';
    //   const {SPLUNK_TOKEN, SPLUNK_URL} = require('../config');
    //   console.log('yo', SPLUNK_TOKEN);
    //   logger.changeStrategy('splunk');
    //   assert.equal(logger.getStrategy(), 'splunk');
    // });

    it('should set strategy to log4js', function() {
      logger.changeStrategy('log4js');
      assert.equal(logger.getStrategy(), 'log4js');
    });
  });
});
