const { redisUrl, redisToken } = require('../config');

module.exports = redisUrl && redisToken ? require('./redisDB') : require('./fileDB');