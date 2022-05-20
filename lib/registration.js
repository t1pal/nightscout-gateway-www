
var kratosAPI = require('@ory/kratos-client');
var _ = require ('lodash');

function create (app, config) {

  var kratos = new kratosAPI.V0alpha2Api(new kratosAPI.Configuration({basePath: config.kratos.public}));

  function fetch_registration_flow (req, res, next) {
    var flow = req.query.flow;
    console.log("QUERY", req.query, flow);
    if (!flow || !_.isString(flow)) {
      console.log("No flow ID found in URL. Initialize Kratos flow.");
      // res.redirect(`${config.kratos.browser}/self-service/registration/browser`);
      // res.end( );
      // return Promise.resolve(false);
      return next( );
    }
    kratos
      .getSelfServiceRegistrationFlow(flow, req.header('Cookie'))
      .then(function (result) {
        if (result.status !== 200) {
          return Promise.reject(flow);
        }
        console.log('result.data.flow', result);
        res.locals.flow = result.data;
        // res.render('registration', result.data.flow);
        next( );
      }).catch(function (err) {
        console.log("ERR", err, arguments);
        res.json(err);
        res.end( );
        // res.redirect(config.oauth.base_url + '/self-service/registration/browser');
        next(err );
      });
  }

  function render_registration (req, res, next) {
    console.log("RES FLOW", res.locals.flow);
    if (!_.isObject(res.locals.flow)) {
      res.redirect(`${config.kratos.browser}/self-service/registration/browser`);
      res.end( );
      return //  next( );
    }
    res.render('registration');
    next( );
  }


  function configure (opts) {
    return [fetch_registration_flow, render_registration];
  }

  var handlers = {
    fetch_registration_flow
  , render_registration
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;


