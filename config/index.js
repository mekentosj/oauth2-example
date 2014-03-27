var nodeEnv = process.env.NODE_ENV || 'development';
var config = {
  development: require('./development'),
  test: require('./test')
};

module.exports = config[nodeEnv];
