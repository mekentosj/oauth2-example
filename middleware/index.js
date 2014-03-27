var models = require('./../models');
var User = models.User;

function requiresUser(req, res, next) {
  if (req.session.userId) {
    req.user = { id: req.session.userId }
    next();
  } else {
    res.app.oauth.authorise()(req, res, next);
  }
}

function loadUser(req, res, next) {
  User.findOne({ email: req.session.userId}, function(err, user) {
    if (err) return next(err);
    res.locals.user = user;
    next();
  });
}

function isValidationError(err) {
  return err && err.name === 'ValidationError';
}

function notFoundHandler(req, res, next) {
  res.status(404);
  res.format({
    html: function() {
      res.render('404', { url: req.url });
    },
    json: function() {
      res.send({ error: 'Not Found' });
    }
  });
}

module.exports.requiresUser = requiresUser;
module.exports.loadUser = loadUser;
module.exports.isValidationError = isValidationError;
module.exports.notFoundHandler = notFoundHandler;
