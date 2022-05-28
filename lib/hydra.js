
var express = require('express');
var hydraClient = require('@ory/hydra-client');
var url = require('url');
var path = require('path');
var kratosAPI = require('@ory/kratos-client');
var _ = require ('lodash');
var crypto = require('crypto');


function urljoin ( ) {
  var base = new url.URL(arguments[0]);
  base.pathname = path.join.apply(path, [base.pathname].concat(Array.prototype.slice.call(arguments, 1)));
  return base.toString( );
}

function configure_hydra (app, config) {

  var hydra_config = new hydraClient.Configuration({ basePath: config.hydra.admin });
  var hydraAdmin = new hydraClient.AdminApi(hydra_config);
  var kratos = new kratosAPI.V0alpha2Api(new kratosAPI.Configuration({basePath: config.kratos.public}));


  function reset_return_to (req, res, next) {
    if (!req.isAuthenticated( )) {
      // reset return URL
      // customize redirect to login
    }
  }

  function initialize_hydra (req, res, next) {
    var challenge = req.query.login_challenge;
    
    if (!challenge) {
      next( new Error("missing login_challenge from hydra") );
      return;
    }

    var hydraLoginState = req.query.hydra_login_state;
    hydraAdmin
      .getLoginRequest(challenge)
      .then(function (login_challenge) {
        console.log("HYDRA LOGIN REQUEST RESPONSE", login_challenge.status, login_challenge.data);
        var body = login_challenge.data;
        if (body.skip) {
          return hydraAdmin
            .acceptLoginRequest(challenge, {
              subject: String(body.subject)
            })
            .then(function (accept_reply) {
              console.login("ACCEPT LOGIN REQUEST WITHIN INIT");
              res.redirect(accept_reply.data.redirect_to);
            });
        }

        console.log("SESSION", req.session);
        if (!_.isString(hydraLoginState) || req.session ? req.session.hydraLoginState !== hydraLoginState : false) {
          console.log("Something wrong with Hydra session!?");
        }

        if (!req.cookies.ory_kratos_session) {
          console.log("NO Kratos Session!?");
        }


        var subject = req.user.identity.id;
        var acceptLoginRequest = {
          subject: subject
        , context: req.user
        };
        console.log('ATTEMPT HYDRA LOGIN', req.user, acceptLoginRequest);
        hydraAdmin.acceptLoginRequest(login_challenge.data.challenge, acceptLoginRequest)
          .then(function login_response (login_response) {
            console.log("LOGIN RESPONSE", login_response.status, login_response.data);
            res.redirect(String(login_response.data.redirect_to));
            next( );

          }).catch(function (err, two) {
            console.log("failed to log with hydra");
            console.log(err, two);
            next(err);
          });;

        /*
        res.locals.hydra = login_challenge;
        res.render('hydra/login', {
          challenge: challenge,
          action: urljoin(app.config.oauth_base, '/connect/login')
        });
        */
      })
      .catch(next);
  }

	function redirectToLogin (req, res, next) {
		if (!req.session) {
			next(Error('Unable to used express-session'))
			return
		}

		// 3. Initiate login flow with ORY Kratos:
		//
		//   - `prompt=login` forces a new login from kratos regardless of browser sessions.
		//      This is important because we are letting Hydra handle sessions
		//   - `redirect_to` ensures that when we redirect back to this url,
		//      we will have both the initial ORY Hydra Login Challenge and the ORY Kratos Login Request ID in
		//      the URL query parameters.
		console.log(
			'Initiating ORY Kratos Login flow because neither a ORY Kratos Login Request nor a valid ORY Kratos Session was found.'
		)

		const state = crypto.randomBytes(48).toString('hex')
		req.session.hydraLoginState = state
		req.session.save(error => {
			if (error) {
				next(error)
				return
			}
			const configBaseUrl =
				config.baseUrl && config.baseUrl != '/' ? config.baseUrl : ''

			console.debug('Return to: ', {
				url: req.url,
				base: configBaseUrl,
				prot: `${req.protocol}://${req.headers.host}`,
				'kratos.browser': config.kratos.browser,
			})
			const baseUrl = configBaseUrl || `${req.protocol}://${req.headers.host}`
			const returnTo = new URL(req.url, baseUrl)
			returnTo.searchParams.set('hydra_login_state', state)
			console.debug(`returnTo: "${returnTo.toString()}"`, returnTo)

			console.debug('new URL: ', [
				config.kratos.browser + '/self-service/login/browser',
				baseUrl,
			])

			const redirectTo = new URL(
				config.kratos.browser + '/self-service/login/browser',
				baseUrl
			)
			redirectTo.searchParams.set('refresh', 'true')
			redirectTo.searchParams.set('return_to', returnTo.toString())

			console.debug(`redirectTo: "${redirectTo.toString()}"`, redirectTo)

			res.redirect(redirectTo.toString())
		})
	}


  function render_consent (req, res, next) {
    var challenge = req.query.consent_challenge;

    if (!challenge) {
      return next(new Error("missing consent challenge workflow"));
    }
    hydraAdmin
      .getConsentRequest(challenge)
      .then(function (consent_request) {
				console.log("CONSENT REQUEST", consent_request.status, consent_request.data);
        if (consent_request.data.skip) {
          return hydraAdmin
            .acceptConsentRequest(challenge, {
              grant_scope: consent_request.data.requested_scope,
              grant_access_token_audience: consent_request.data.requested_access_token_audience,
              session: {
								example_permission: 'granted'
              }
            })
            .then(function (consent_reply) {
              res.redirect(consent_reply.data.redirect_to);
            });
        }
        res.locals = consent = consent_request.data;
        res.render('hydra/consent', {
          challenge: challenge,
          requested_scope: consent_request.data.requested_scope,
          user: consent_request.data.subject,
          client: consent_request.data.client,
          action: urljoin(config.oauth.base_url, '/auth/hydra/consent')
        });
      })
  }

  function process_consent_attempt (req, res, next) {
    const challenge = req.body.challenge;

    if (req.body.submit === 'Deny access') {
      return (hydraAdmin
        .rejectConsentRequest(challenge, {
          error: 'access_denied',
          error_description: 'The resource owner denied the request'
        })
        .then(function (denial) {
          res.redirect(denial.data.redirect_to);
        })
        .catch(next)
      );

    }
    // grant conssent
    var grantScope = req.body.grant_scope;
    if (!Array.isArray(grantScope)) {
      grantScope = [grantScope];
    }
    var oauth_session = {
      access_token: {
        foo: 'bar'
      , permit: 'custom'
      },
      id_token: {
        qux: 'quiz'
      , email: req.user.identity.traits.email
      , in_group: 'special group'
      }
    };
    hydraAdmin
      .getConsentRequest(challenge)
      .then(function (consent_request) {
        console.log("GRANTING CONSENT FOR USER", req.user, oauth_session, consent_request.status, consent_request.data);
        return hydraAdmin
          .acceptConsentRequest(challenge, {
            grant_scope: grantScope,
            session: oauth_session,
            grant_access_token_audience: consent_request.data.requested_access_token_audience,
            remember: Boolean(req.body.remember),
            remember_for: 0
          })
          .then(function (consent_reply) {
            res.redirect(consent_reply.data.redirect_to);
          })
          .catch(next)

      })
      .catch(next)
  }

  var router = express.Router( );
  router.get('/login', initialize_hydra);
  router.get('/consent', render_consent);
  router.post('/consent', process_consent_attempt);
  // return router;

  function create (opts) {
    return router;
  }
  return create;
}

module.exports = configure_hydra;

