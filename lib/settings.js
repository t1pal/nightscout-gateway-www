
var kratosAPI = require('@ory/kratos-client');
var _ = require ('lodash');

function create (app, config) {

  var kratos = new kratosAPI.V0alpha2Api(new kratosAPI.Configuration({basePath: config.kratos.public}));


  function fetch_settings_flow (req, res, next) {
    var flow = req.query.flow;
    if (!flow || !_.isString(flow)) {
      console.log("No flow ID found in URL. Initialize Kratos flow.");
      res.redirect(`${config.kratos.browser}/self-service/settings/browser`);
      return next( );
    }
    kratos
      .getSelfServiceSettingsFlow(flow, undefined, req.header('Cookie'))
      .then(function (result) {
        if (result.status !== 200) {
          return Promise.reject(flow);
        }
        console.log('result.data.flow', result);
        res.locals.flow = result.data;
        // res.render('registration', result.data.flow);
        next( );
      }).catch(function (err) {
        res.redirect(config.oauth.base_url + '/self-service/settings/browser');
        res.end();
        next( );
      });
  }

  function render_settings (req, res, next) {
    // available in flow.identity
    res.locals.user = req.user;
    res.render('settings');
    next( );
  }


  function configure (opts) {
    return [fetch_settings_flow, render_settings];
  }

  var handlers = {
    fetch_settings_flow
  , render_settings
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;


