
var kratosAPI = require('@ory/kratos-client');
var _ = require ('lodash');

function create (app, config) {

  var kratos = new kratosAPI.V0alpha2Api(new kratosAPI.Configuration({basePath: config.kratos.public}));


  function fetch_recovery_flow (req, res, next) {
    var flow = req.query.flow;
    if (!flow || !_.isString(flow)) {
      console.log("No flow ID found in URL. Initialize Kratos flow.");
      res.redirect(`${config.kratos.browser}/self-service/recovery/browser`);
      return next( );
    }
    kratos
      .getSelfServiceRecoveryFlow(flow, req.header('Cookie'))
      .then(function (result) {
        if (result.status !== 200) {
          return Promise.reject(flow);
        }
        console.log('result.data.flow', result);
        res.locals.flow = result.data;
        // res.render('registration', result.data.flow);
        next( );
      }).catch(function (err) {
        res.redirect(config.oauth.base_url + '/self-service/recovery/browser');
        res.end();
        next({} );
      });
  }

  function render_recovery (req, res, next) {
    if (res.locals.flow) {
      res.render('recovery');
    }
    next( );
  }


  function configure (opts) {
    return [fetch_recovery_flow, render_recovery];
  }

  var handlers = {
    fetch_recovery_flow
  , render_recovery
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;


