
var path = require('path');
var crypto = require('crypto');
var cookieSecret = crypto.randomBytes(48).toString('hex');

var config = {
  port: parseInt(process.env.PORT || '3044'),
  express: { 
    views_path: process.env.EXPRESS_VIEWS_PATH || path.join(__dirname, 'views'),
    static_path: process.env.EXPRESS_STATIC_PATH || path.join(__dirname, 'public'),
    stylus_path: process.env.EXPRESS_STYLUS_PATH || path.join(__dirname, 'public'),
    session_secret: process.env.EXPRESS_SESSION_SECRET || 'change this'
  },
  software: {
    name: process.env.SOFTWARE_NAME || 'Program Name',
    salutation: process.env.SOFTWARE_SALUTATION || 'Hello World.',
    author: process.env.SOFTWARE_AUTHOR || 'Author',
  },
  oauth: {
    resources: process.env.OAUTH_RESOURCES || 'https://gateway.dummy0/',
    base_url: process.env.OAUTH_BASE_URL || 'https://gateway.dummy0/', // 'http://169.254.1.1:4944',
    auth_url: process.env.OAUTH_AUTH_URL || 'https://gateway.dummy0/oauth2/auth',
    token_url: process.env.OAUTH_TOKEN_URL || process.env.OAUTH_AUTH_URL || 'https://gateway.dummy0/oauth2/token',
    client_id: process.env.OAUTH_CLIENT_ID || 'invalid',
    client_secret: process.env.OAUTH_CLIENT_SECRET || 'invalid',
  },
  dummy: {
    testA: {
      client_id: 'ec9d2058-8b95-4ecc-8eba-454534f8165a',
      client_secret: 'tFfRn4qP2JG~nOKHXQ8ZrsWp93'

    },
    testB: {
      client_id: '8c4df38b-4d5b-4b0d-b1b6-635577e1ea4f',
      client_secret: '3Ti8Q~TbRJ2-ZChGJluKRzX5ZT' 

    },


  },
  kratos: {
    browser: process.env.KRATOS_BROWSER_URL,
    admin:  process.env.KRATOS_ADMIN_URL,
    public: process.env.KRATOS_PUBLIC_URL
  },
  hydra: {
    admin:  process.env.HYDRA_ADMIN_URL
  },
  gateway: {
    api: process.env.NIGHTSCOUT_GATEWAY_API || 'http://169.254.1.1:3883'
  },
  cookieSecret: process.env.COOKIE_SECRET || cookieSecret

};
config.express.favicon = process.env.EXPRESS_FAVICON || path.join(config.express.static_path, 'images/favicon.png');


module.exports = exports = config;
