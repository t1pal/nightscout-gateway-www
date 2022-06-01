
const express = require('express');
const refresh = require('passport-oauth2-refresh');
const passport = require('passport');
const OAUth2Strategy = require('passport-oauth2');
const path = require('path');
const url = require('url');
const t1pal_client = require('../api');
const loginSession = require('../session');

function index (req, res){
  res.locals.show_debug = req.query.debug == '1';
  res.render('index', req.query);
}

function create_middleware (app, config) {

  function ensureAuthenticated (req, res, next) {
    if (!req.isAuthenticated( )) {
      req.session.return_url = req.url;
      res.redirect('/auth/connect')
      return;
    }
    next( );
  }

  var wares = {
    ensureAuthenticated: ensureAuthenticated
  };
  return wares;

}

function create_strategy (app, config) {
  var callback_base = new url.URL(config.oauth.base_url);
  callback_base.pathname = path.join(callback_base.pathname, '/auth/t1pal');
  var callback_url = callback_base.toString( );
  // path.join(config.oauth.base_url, '/auth/t1pal');
  var strategy = new OAUth2Strategy({
    authorizationURL: config.oauth.auth_url,
    tokenURL: config.oauth.token_url,
    clientID: config.oauth.client_id,
    clientSecret: config.oauth.client_secret,
    callbackURL: callback_url,
    state: true,
    scope: ['offline', 'openid']
  }, function (accessToken, refreshToken, profile, cb) {
    cb(null, { accessToken: accessToken, profile: profile });
  });
  return strategy;
}

function defaultRoutes (app, config) {

  var middleware = create_middleware(app, config);
  var set_links = require('../nav')(app, config)( );
  const router = express.Router( );

  var kratosSession = loginSession(app, config);
  // passport.use('kratos', kratosSession.strategy);
  passport.use('oauth2', create_strategy(app, config));
  passport.serializeUser(function (user, done) {
    console.log('serializing user', user);
    done(null, JSON.stringify(user));
  });

  passport.deserializeUser(function (user, done) {
    console.log('deserializing user', user);
    done(null, JSON.parse(user));
  });


  // router.get('/auth/connect', passport.authenticate('oauth2'));
  // router.get('/auth/logout', index);
  router.get('/auth/t1pal', passport.authenticate('oauth2'), function (req, res, next) { 
    var return_url = req.session.return_url || '/dashboard';
    req.session.return_url = '';
    res.redirect(return_url);
  });

  function get_userinfo (req, res, next) {
    console.log('attaching', req.user.accessToken, 'to', config.oauth.resources);
    var client = t1pal_client({baseURL: config.oauth.resources, token: req.user.accessToken});
    client.get('/api/v1/own/account/sites.json').then(function (info) {
      console.log('axios response', info);
      res.locals.sites = info.data;
      next( );
    })
    .catch(function (err) {
      res.locals.error = err;
      next( );
    });
  }

  function get_site_info (req, res, next) {

    var client = t1pal_client({baseURL: config.oauth.resources, token: req.user.accessToken});
    client.get('/api/v1/own/account/sites/' + req.params.site_name).then(function (runtime) {
      res.locals.site_runtime = runtime.data;
      next( );
    })
    .catch(next);
  }


  function get_site_views (req, res, next) {

    var client = t1pal_client({baseURL: config.oauth.resources, token: req.user.accessToken});
    client.get('/api/v1/own/account/sites/' + req.params.site_name + '/views').then(function (info) {
      res.locals.site_views = info.data;
      next( );
    })
    .catch(next);
  }


  function render_dashboard (req, res, next) {

    res.locals.user = req.user;
    res.render('dashboard', req.query);

  }

  function render_details (req, res, next) {
    res.render('details', req.query);
  }

  function set_debug_flag (req, res, next) {
    res.locals.show_debug = req.query.debug == '1';
    next( );
  }

  router.use(set_debug_flag);
  // router.get('/dashboard', middleware.ensureAuthenticated, get_userinfo, render_dashboard);
  router.get('/details/:site_name', middleware.ensureAuthenticated, set_links, get_site_info, get_site_views, render_details);


  const registrationRoute = require('../registration')(app, config);
  const loginRoute = require('../login')(app, config);
  const logoutRoute = require('../logout')(app, config);
  const settingsRoute = require('../settings')(app, config);
  const errorRoute = require('../error')(app, config);
  const verificationRoute = require('../verification')(app, config);
  const recoveryRoute = require('../recovery')(app, config);
  const dashboardRoute = require('../dashboard')(app, config);

  router.get('/auth/registration', set_links, registrationRoute( ));
  router.get('/auth/login', set_links, loginRoute( ));
  router.get('/auth/logout', set_links, logoutRoute( ));
  router.get('/error', set_links, errorRoute( ));

  router.get('/verify', set_links, verificationRoute( ));
  router.get('/recovery', set_links, recoveryRoute( ));


  router.get('/dashboard', kratosSession.handlers.ensureLoggedIn, set_links, dashboardRoute( ));

  router.get('/settings', kratosSession.handlers.ensureLoggedIn, set_links, settingsRoute( ));

  const hydraRoutes = require('../hydra')(app, config);

  router.use('/auth/hydra/', kratosSession.handlers.ensureLoggedIn, set_links, hydraRoutes( ));
  // router.get('/auth/hydra/login');
  // router.get('/auth/hydra/consent');
  // router.post('/auth/hydra/consent');

  const invitationRoutes = require('../invitations')(app, config);
  router.use('/invitations/', kratosSession.handlers.ensureLoggedIn, set_links, invitationRoutes( ));
  // router.get('/invitations/:expected_name/review');
  // router.get('/invitations/:expected_name/rsvp');

  const portalRoutes = require('../portal')(app, config);
  router.use('/portal/', kratosSession.handlers.ensureLoggedIn, set_links, portalRoutes( ));

  router.get('/', set_links, index);
  router.post('/about/health/check');

  return router;


}

module.exports = exports = defaultRoutes;

exports.index = index;
