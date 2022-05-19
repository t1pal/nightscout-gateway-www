
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
    resources: process.env.OAUTH_RESOURCES || 'https://t1pal.host/',
    base_url: process.env.OAUTH_BASE_URL || 'https://t1pal-partner-example.dummy0/', // 'http://169.254.1.1:4944',
    auth_url: process.env.OAUTH_AUTH_URL || 'https://account.t1pal.host/oauth2/auth',
    token_url: process.env.OAUTH_TOKEN_URL || process.env.OAUTH_AUTH_URL || 'https://account.t1pal.host/oauth2/token',
    client_id: process.env.OAUTH_CLIENT_ID || 'invalid',
    client_secret: process.env.OAUTH_CLIENT_SECRET || 'invalid',
  },
  kratos: {
    browser: process.env.KRATOS_BROWSER_URL,
    admin:  process.env.KRATOS_ADMIN_URL,
    public: process.env.KRATOS_PUBLIC_URL
  },
  hydra: {
    admin:  process.env.HYDRA_ADMIN_URL
  },
  cookieSecret: process.env.COOKIE_SECRET || cookieSecret

};
config.express.favicon = process.env.EXPRESS_FAVICON || path.join(config.express.static_path, 'images/favicon.png');


module.exports = exports = config;
