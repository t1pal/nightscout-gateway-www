var _ = require ('lodash');

function create (app, config) {


  function fetch_dashboard_flow (req, res, next) {
    res.locals.user = req.user;
    next( );
  }

  function render_dashboard (req, res, next) {
    res.render('dashboard');
    next( );
  }


  function configure (opts) {
    return [fetch_dashboard_flow, render_dashboard];
  }

  var handlers = {
    fetch_dashboard_flow
  , render_dashboard
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;


