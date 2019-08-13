module.exports = {
  LOGGER: process.env.LOGGER || 'console',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '80',
  KEY: process.env.KEY || '', // must be set, cannot be empty

  LOG4JS_LEVEL: process.env.LOG4JS_LEVEL || 'info',
  LOG4JS_FILENAME: process.env.LOG4JS_FILENAME || './logs/app.log',
  LOG4JS_CATEGORY: process.env.LOG4JS_CATEGORY || 'app',
  LOG4JS_MAXLOGSIZE: process.env.LOG4JS_MAXLOGSIZE || 1000000,
  LOG4JS__BACKUPS: process.env.LOG4JS_BACKUPS || 5,

  SPLUNK_TOKEN: process.env.SPLUNK_TOKEN,
  SPLUNK_URL: process.env.SPLUNK_URL,
};
