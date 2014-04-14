var app = require('./../app');
var assert = require('assert');
var should = require('should');
var request = require('supertest');
var models = require('./../models');

describe('OAuth request auth code', function() {
    var authCode;
    var accessToken;
    var refreshToken;
    var clientSecretBase64 = new Buffer('123').toString('base64');
    var clientCredentials = 'papers3' + clientSecretBase64;

    var cookies;
    before(function (done) {
      request(app)
         .post('/session')
           .send({
              email: 'alex@example.com',
              password: 'test'
           })
           .end(function (err, res) {
             cookies = res.headers['set-cookie'];
             done(err);
           });
    });

    it('should allow code to be requested', function(done) {
        request(app)
            .post('/oauth/authorise')
            .type('form')
            .set('Cookie', cookies)
            .send({
                allow: 'yes',
                client_id: 'papers3',
                client_secret: '123',
                response_type: 'code',
                redirect_uri: '/oauth/redirect'
            })
            .expect(302)
            .end(function(err, res) {
                res.header['location'].should.include('code')
                var url = res.header['location'];
                authCode = url.substr(url.indexOf('code=') + 5);
                done();
            });
    });

    it('should allow tokens to be requested with auth code', function(done) {
        request(app)
            .post('/oauth/token')
            .type('form')
            .auth(clientCredentials, '')
            .send({
                grant_type: 'authorization_code',
                code: authCode,
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
