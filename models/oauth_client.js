var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var authorizedClientIds = ['papers3', 'papers3-mac'];

var OAuthClientsSchema = new Schema({
  clientId: String,
  clientSecret: String,
  redirectUri: String
});

OAuthClientsSchema.static('getClient', function(clientId, clientSecret, callback) {
  OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }, callback);
});

OAuthClientsSchema.static('grantTypeAllowed', function(clientId, grantType, callback) {
  if (grantType === 'password' || grantType === 'authorization_code') {
    return callback(false, authorizedClientIds.indexOf(clientId) >= 0);
  }

  callback(false, true);
});

mongoose.model('oauth_clients', OAuthClientsSchema);
var OAuthClientsModel = mongoose.model('oauth_clients');
module.exports = OAuthClientsModel;
