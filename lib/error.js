
var kratosAPI = require('@ory/kratos-client');
var _ = require ('lodash');

function create (app, config) {

  var kratos = new kratosAPI.V0alpha2Api(new kratosAPI.Configuration({basePath: config.kratos.public}));


  function fetch_error_id (req, res, next) {
    var id = req.query.id;
    if (!id || !_.isString(id)) {
      console.log("No id ID found in URL. Initialize Kratos id.");
      res.redirect('welcome');
      res.end( );
      return next( );
    }
    kratos
      .getSelfServiceError(id, req.header('Cookie'))
      .then(function (result) {
        if (result.status !== 200) {
          return Promise.reject(id);
        }
        console.log('result.data.id', result);
        res.locals.error = result.data;
        res.locals.message = JSON.stringify(result.data.error, null, 2);
        // res.render('registration', result.data.id);
        next( );
      }).catch(function (err) {
        res.redirect(config.oauth.base_url + '/self-service/error/browser');
        res.end();
        next(err);
      });
  }

  function render_error (req, res, next) {
    res.status(500).render('error');
    next( );
  }


  function configure (opts) {
    return [fetch_error_id, render_error];
  }

  var handlers = {
    fetch_error_id
  , render_error
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;


