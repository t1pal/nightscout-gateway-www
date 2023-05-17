
var kratosAPI = require('@ory/kratos-client');
var passportCustom = require('passport-custom');

function create (app, config) {

  var kratos = new kratosAPI.V0alpha2Api(new kratosAPI.Configuration({basePath: config.kratos.public}));
  var strategy = new passportCustom.Strategy(
    function (req, callback) {
      kratos
        .toSession(undefined, req.header('Cookie'))
        .then(function (result) {
          callback(null, result.session);
        }).catch(callback);
    }
  );


  function ensureLoggedIn (req, res, next) {
    kratos
      .toSession(undefined, req.header('Cookie'))
      .then(function (result) {
        console.log("HAS USER");
        req.user = result.data;
        next( );
      }).catch(function (err) {
        console.log("NO USER");
        res.redirect(config.oauth.base_url + '/auth/login');
        next( );
      });
  }

  function checkLoggedIn (req, res, next) {
    kratos
      .toSession(undefined, req.header('Cookie'))
      .then(function (result) {
        console.log("HAS USER");
        req.user = result.data;
        next( );
      }).catch(function (err) {
        console.log("NO USER", err.response.data, err.response.data.error);
        next( );
      });
  }

  function configure (opts) {
    return ensureLoggedIn;
  }

  var handlers = {
    ensureLoggedIn,
    checkLoggedIn
  };
  configure.handlers = handlers;
  configure.strategy = strategy;
  return configure;
}

module.exports = exports = create;

