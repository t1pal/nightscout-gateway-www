
var express = require('express');
var _ = require ('lodash');
var axios = require('axios');
var passport = require('passport');
var url = require('url');
var path = require('path');
const OAUth2Strategy = require('passport-oauth2');
const OpenIDConnectStrategy = require('passport-openidconnect');

function create_client (opts) {
  var instance = axios.create({
    baseURL: opts.baseURL,
  });
  return instance;
}

function create_strategy (app, config) {
  var callback_base = new url.URL(config.oauth.base_url);
  callback_base.pathname = path.join(callback_base.pathname, '/auth/t1pal');
  // var callback_url = callback_base.toString( );
  var callback_url = 'https://gateway.dummy0/invitations/foo/rsvp';
  // path.join(config.oauth.base_url, '/auth/t1pal');
  var alt_strategy = new OAUth2Strategy({
    authorizationURL: config.oauth.auth_url,
    tokenURL: config.oauth.token_url,
    clientID: config.dummy.testA.client_id,
    clientSecret: config.dummy.testA.client_secret,
    callbackURL: callback_url,
    state: true,
    scope: ['offline', 'openid', 'profile', 'rsvp'  ]
  }, function (accessToken, refreshToken, profile, cb) {
    console.log("OBTAINED PROFILE AND CONSENT", accessToken, refreshToken, profile);
    cb(null, { accessToken: accessToken, profile: profile });
  });
  alt_strategy.userProfile = function fetchUserProfile(accessToken, done) {

    var inst = axios.create({baseURL: 'https://gateway.dummy0/', headers: { authorization: `Bearer ${accessToken}` } } );
    
    inst.get('/userinfo').then(function (resp) {
      console.log("FETCHED USERINFO", resp.status, resp.data);
      done(null, resp.data);
    }).catch(function failed (err) {
      console.log("FAILED", err);
      done(err);
    });
    // done(null, {});
  };
  var strategy = new OpenIDConnectStrategy({
    issuer: 'https://gateway.dummy0',
    authorizationURL: config.oauth.auth_url,
    tokenURL: config.oauth.token_url,
    userInfoURL: 'https://gateway.dummy0/userinfo',
    clientID: config.dummy.testA.client_id,
    clientSecret: config.dummy.testA.client_secret,
    scope: ['offline', 'openid', 'profile', 'rsvp'  ],
    callbackURL: callback_url
    }, function verify (issuer, profile, cb) {
      console.log("OBTAINED PROFILE AND CONSENT to JOIN GROUP", issuer, profile);
      cb(null, { issuer: issuer, profile: profile });

    }
  );
  return alt_strategy;
}


function factory (app, config) {
  var nrg = create_client({baseURL: config.gateway.api });

  var strat = create_strategy(app, config);
  var router = express.Router( );
  passport.use('custom-oauth2', strat);
  router.get('/auth', redirect_via_hydra);
  router.get('/:expected_name/join', passport.authenticate('custom-oauth2'));
  router.get('/:expected_name/rsvp', passport.authenticate('custom-oauth2', { failureMessage: true }), function (req, res, next) { 
    console.log("FINISHED CONSENT TO JOIN A GROUP", req.auth)
    var return_url = req.session.return_url || '/dashboard';
    req.session.return_url = '';
    res.redirect(return_url);
  });
  // router.get('/rsvp', render_rsvp);


  function redirect_via_hydra (req, res, next) {

    next( );
  }

  function render_rsvp (req, res, next) {
    next( );

  }

  function create (opts) {
    return router;
  }
  return create;
}

module.exports = exports = factory;

