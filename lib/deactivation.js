
var kratosAPI = require('@ory/kratos-client');
function create (app, config) {

  var kratos = new kratosAPI.V0alpha2Api(new kratosAPI.Configuration({basePath: config.kratos.admin}));

  function deactivate_check (req, res, next) {
    console.log("DEACTIVATING USER", req.user);
    var traits = req.user.identity.traits;
    var needed_confirmation = [ traits.name.first, traits.name.last ].join(' ');
    if (req.body.confirmed_deactivation != needed_confirmation) {
      return res.redirect('/settings?deactivationStatus=Unclear#settingsDeactivate');
    }
    res.locals.remove_identity = req.user.identity.id;
    next( );

  }

  function remove_from_kratos (req, res, next) {
    kratos.adminDeleteIdentity(res.locals.remove_identity).then(function (removed) {
      console.log("REMOVED IDENTITY", removed);
      return res.redirect('/auth/logout');
    }).catch(function (err) {
      console.log("PROBLEM REMOVING IDENTITY FROM KRATOS", err);
      return res.redirect('/settings');
      // next(err);
    });
  }

  function configure (opts) {
    return [deactivate_check, remove_from_kratos];
  }

  var handlers = {
    deactivate_check
  , remove_from_kratos
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;
