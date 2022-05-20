
var kratosAPI = require('@ory/kratos-client');
var _ = require ('lodash');

function create (app, config) {

  var kratos = new kratosAPI.V0alpha2Api(new kratosAPI.Configuration({basePath: config.kratos.public}));


  function fetch_logout_flow (req, res, next) {
    kratos
      // .getSelfServiceLogoutFlowUrlForBrowsers
      .createSelfServiceLogoutFlowUrlForBrowsers(req.header('Cookie'))
      .then(function (result) {
        console.log(arguments);
        if (result.status !== 200) {
          return Promise.reject(flow);
        }
        console.log('result.data.flow', result);
        res.locals.logout_url = result.data.logout_url || '';
        next( );
      }).catch(function (err) {
        res.locals.logout_url = '';
        next( );
      });
  }

  function do_logout (req, res, next) {
    res.redirect(res.locals.logout_url);
    next( );
  }


  function configure (opts) {
    return [fetch_logout_flow, do_logout];
  }

  var handlers = {
    fetch_logout_flow
  , do_logout
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;


