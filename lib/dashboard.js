var _ = require ('lodash');
var axios = require('axios');

function create_client (opts) {
  var instance = axios.create({
    baseURL: opts.baseURL,
  });
  return instance;
}

function create (app, config) {

  var nrg = create_client({baseURL: config.gateway.api });

  function fetch_dashboard_flow (req, res, next) {
    res.locals.user = req.user;
    next( );
  }

  function fetch_available_sites (req, res, next) {
    nrg.get('/api/v1/privy/' + req.user.identity.id + '/groups/joined' ).then(function (results) {
      res.locals.sites_available = results.data;
      next( );

    }).catch(next);
  }

  function fetch_invitations (req, res, next) {
    nrg.get('/api/v1/privy/' + req.user.identity.id + '/groups/available' ).then(function (results) {
      res.locals.groups_available = results.data;
      next( );

    }).catch(next);
  }

  function fetch_activity (req, res, next) {
    next( );
  }

  function render_dashboard (req, res, next) {
    res.render('dashboard');
    next( );
  }


  function configure (opts) {
    return [fetch_dashboard_flow, fetch_available_sites, fetch_invitations, render_dashboard];
  }

  var handlers = {
    fetch_dashboard_flow
  , render_dashboard
  , fetch_invitations
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;


