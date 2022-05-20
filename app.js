
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./lib/routes')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , config = require('./env')
  , passport = require('passport')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , csrf = require('csurf')
  ;

var app = express();

app.set('port', config.port);
app.set('views', config.express.views_path);
app.set('view engine', 'pug');
app.use(favicon(config.express.favicon));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('query parser', 'extended');
app.use(require('stylus').middleware(config.express.stylus_path));
app.use(express.static(config.express.static_path));


var session_config = {
  secret: config.express.session_secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
};

if (app.get('env') == 'development') {
	app.locals.pretty = true;
}

app.locals.software = config.software;
  app.set('trust proxy', 1);
  session_config.cookie.secure == true;

if (app.get('env') == 'production') {
  app.set('trust proxy', 1);
  session_config.cookie.secure == true;
}

app.use(cookieParser( ));
app.use(session(session_config));
app.use(passport.initialize( ));
app.use(passport.session( ));


app.get('/', routes.index);
app.use(routes(app, config));


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
