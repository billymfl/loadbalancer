const {LOGGER} = require('../config');
const LogStrategy = require('./LogStrategy');

/**
 * Logger class that uses the selected logging strategy. Defaults to console.
 */
class Logger {
  /**
     * @param  {string} strategy
     */
  constructor(strategy = 'console') {
    this.strategy = LogStrategy.setStrategy(strategy);
  }

  /**
   * Changes the logger used
   * @param  {string} newStrategy
   */
  changeStrategy(newStrategy) {
    this.strategy = LogStrategy.setStrategy(newStrategy);
  }

  /**
   * gets logging strategy
   * @return {string}
   */
  getStrategy() {
    return LogStrategy.getStrategy();
  }

  /**
   * @param  {string} message
   */
  log(message) {
    this.strategy(message);
  }
}

module.exports = new Logger(LOGGER);
