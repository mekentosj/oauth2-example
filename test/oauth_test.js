var app = require('./../app');
var assert = require('assert');
var request = require('supertest');
var models = require('./../models');

describe('OAuth sign in', function() {
  var accessToken;
  var refreshToken;
  var clientSecretBase64 = new Buffer('123').toString('base64');
  var clientCredentials = 'papers3' + clientSecretBase64;

  it('should allow tokens to be requested', function(done) {
    request(app)
      .post('/oauth/token')
      .type('form')
      .auth(clientCredentials, '')
      .send({
        grant_type: 'password',
        username: 'alex@example.com',
        password: 'test',
        client_id: 'papers3',
        client_secret: '123'
      })
      .expect(200)
      .end(function(err, res) {
        assert(res.body.access_token, 'Ensure the access_token was set');
        assert(res.body.refresh_token, 'Ensure the refresh_token was set');
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;

        done();
      });
  });

  it('should permit access to routes that require a refresh_token', function(done) {
    request(app)
      .get('/secret')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200, done);
  });

  it('should allow the refresh token to be used to get a new access token', function(done) {
    request(app)
      .post('/oauth/token')
      .type('form')
      .auth(clientCredentials, '')
      .send({
        grant_type: 'refresh_token',
        username: 'alex@example.com',
        password: 'test',
        client_id: 'papers3',
        client_secret: '123',
        refresh_token: refreshToken
      })
      .expect(200)
      .end(function(err, res) {
        assert(res.body.access_token, 'Ensure the access_token was set');
        assert(res.body.refresh_token, 'Ensure the refresh_token was set');
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;

        done();
      });
  });

  it('should forbid access with an expired access token', function(done) {
    var getAccessToken = models.oauth.getAccessToken;
    var saveAccessToken = models.oauth.saveAccessToken;

    getAccessToken(accessToken, function(err, token) {
      saveAccessToken(token.accessToken, token.clientId, new Date(1), token.userId, function() {
        request(app)
          .get('/secret')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(401, done);
      });
    });
  });
});
