var models = require('./../models');

var fixtures = {
  clients: [{
    clientId: 'papers3',
    clientSecret: '123',
    redirectUri: '/oauth/redirect'
  }],

  users: [{
    email: 'alex@example.com',
    hashed_password: '$2a$10$aZB36UooZpL.fAgbQVN/j.pfZVVvkHxEnj7vfkVSqwBOBZbB/IAAK',
    papers_library_id: '1234-abcd-efgh-ijkl'
  }]
};

function insertData(model, fixture, cb) {
  var o = new model(fixture);
  o.save(cb);
}

var connection = models.mongoose.connection;

before(function(cb) {
  connection.on('open', function() {
    connection.db.dropDatabase(function() {
      insertData(models.User, fixtures.users[0], function() {
        insertData(models.OAuthClientsModel, fixtures.clients[0], cb);
      });
    });
  });
});
