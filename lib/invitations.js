
var express = require('express');
var _ = require ('lodash');
var axios = require('axios');
var passport = require('passport');
var url = require('url');
var path = require('path');
var crypto = require('crypto');
const OAUth2Strategy = require('passport-oauth2');
const OpenIDConnectStrategy = require('passport-openidconnect');
const simpleOAuth2 = require('simple-oauth2');

function create_client (opts) {
  var instance = axios.create({
    baseURL: opts.baseURL,
  });
  return instance;
}

function create_strategy (app, config, cfg) {
  var callback_base = new url.URL(config.oauth.base_url);
  callback_base.pathname = path.join(callback_base.pathname, '/auth/t1pal');
  // var callback_url = callback_base.toString( );
  var callback_url = 'https://gateway.dummy0/invitations/foo/rsvp';
  if (cfg) {
    callback_url = config.oauth.base_url + `/invitations/${cfg.expected_name}/rsvp`;
  }
  // path.join(config.oauth.base_url, '/auth/t1pal');
  var clientID = cfg && cfg.client_id || config.dummy.testA.client_id;
  var clientSecret = cfg && cfg.client_secret || config.dummy.testA.client_secret;
  var alt_strategy = new OAUth2Strategy({
    authorizationURL: config.oauth.auth_url,
    tokenURL: config.oauth.token_url,
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callback_url,
    state: true,
    scope: ['offline', 'openid', 'profile', 'rsvp'  ]
  }, function (accessToken, refreshToken, profile, cb) {
    console.log("OBTAINED PROFILE AND CONSENT", accessToken, refreshToken, profile);
    cb(null, { accessToken: accessToken, profile: profile });
  });
  alt_strategy.notauthorizationParams = function authorizationParams(options) {
    var audience = [ 'https://gateway.dummy0/groups/some_group_id', 'https://baz.gateway.dummy0' ];
    var params = {
      audience: audience.join(' ')
    };
    return params;

  };
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
    issuer: 'https://gateway.dummy0/',
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
  // return strategy;
}


function factory (app, config) {
  var nrg = create_client({baseURL: config.gateway.api });

  var strat = create_strategy(app, config);
  var router = express.Router( );
  passport.use('custom-oauth2', strat);
  router.get('/auth', redirect_via_hydra);
  // router.get('/:expected_name/join', passport.authenticate('custom-oauth2'));
  router.get('/:expected_name/join', get_client_config, forward_passport);
  router.get('/:expected_name/rsvp', get_client_config, forward_passport
  , function (req, res, next) { 
    console.log("FINISHED CONSENT TO JOIN A GROUP", req.auth)
    var return_url = req.session.return_url || '/dashboard';
    req.session.return_url = '';
    res.redirect(return_url);
  });
  /*
  router.get('/:expected_name/rsvp', passport.authenticate('custom-oauth2', { failureMessage: true }),
  function (req, res, next) { 
    console.log("FINISHED CONSENT TO JOIN A GROUP", req.auth)
    var return_url = req.session.return_url || '/dashboard';
    req.session.return_url = '';
    res.redirect(return_url);
  });
  */
  // router.get('/rsvp', render_rsvp);


  function forward_passport (req, res, next) {
    return passport.authenticate(req.strategy)(req, res, next);
  }

  function redirect_via_hydra (req, res, next) {

    var redirect_uri = config.oauth.base_url + `/invitations/${req.params.expected_name}/rsvp`;
		const state = crypto.randomBytes(48).toString('hex');
    var authorization_url = req.oauth.authorizeURL({
      redirect_uri: redirect_uri
    , scope: ['offline', 'openid', 'profile', 'rsvp'  ]
    , state: state
    // , audience: [ ]

    });
    res.redirect(authorization_url);
  }

  function handle_callback (req, res, next) {
    var options = {
      code: req.query.code
    };
    req.oauth.getToken(options).then(function (accessToken) {
      console.log("GOT ACCESS", arguments, accessToken);
      req.auth = accessToken;
      next( );

    });
  }

  function render_rsvp (req, res, next) {
    next( );

  }

  function get_client_config (req, res, next) {
    return nrg.get(`/api/v1/privy/${req.user.identity.id}/groups/available/${req.params.expected_name}`).then(function (candidates) {
      console.log("RESULTS FROM FETCHING AVAILABLE", candidates.data);
      var candidate = candidates.data.results.data[0];
      var client_id = candidate.client_id;
      nrg.get(`/api/v1/clients/${client_id}`).then(function (client_resp) {
        var client_config = client_resp.data.results.data;
        req.oauth_config = client_config;

        req.oauth = new simpleOAuth2.AuthorizationCode({
          client: {
            id: client_config.client_id,
            secret: client_config.client_secret
          },
          auth: {
            tokenHost: config.oauth.base_url,
            authorizePath: config.oauth.auth_url,
            tokenPath: config.oauth.token_url
          }
        });

        req.strategy = create_strategy(app, config, client_config);
        // req.authorization_uri = req.oauth.authorizeURL({ });
        next( );
      });

    });
  }


  function create (opts) {
    return router;
  }
  return create;
}

module.exports = exports = factory;

