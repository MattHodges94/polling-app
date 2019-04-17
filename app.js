var https = require('https');
var http = require('http');
var express = require('express');
var app = express();
var debug = require('debug')('test:server');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var credentials = require('./config/credentials');
var url = credentials.databaseUrl;
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session')
var flash = require('connect-flash')
var cookieParser = require('cookie-parser');

/* Initialise server */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const isProduction = 'production' === process.env.NODE_ENV;

// for live
// var server = https.createServer({key: fs.readFileSync(credentials.key, 'utf8'), cert: fs.readFileSync(credentials.cert, 'utf8')}, app);
// for local development or http on live
var server = http.createServer(app);

/* End initialise server */

/* Initialise websocket server */

const WebSocket = require('ws');
const WebSocketServer = require('ws').Server,
wss = new WebSocketServer({server})

require('./config/sockets')(wss);

/* End initialise websocket server */

var index = require('./routes/index');
var poll = require('./routes/poll')(wss);
var login = require('./routes/login')(passport);

mongoose.connect(url)

require('./config/passport')(passport); // pass passport for configuration
app.use(cookieParser());
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 

// passport config
app.use(session({ secret: credentials.passportSecret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true 
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(index);
app.use(poll);
app.use(login);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/* Functions */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

function browserSync() {
  const browserSync = require('browser-sync').create();

  browserSync.init({
    files: ['public/**/*', 'views/**/*', 'routes/**/*'],
      online: false,
      open: false,
      port: port + 1,
      proxy: 'localhost:' + port,
      ui: false
  });
}

/* End funcitons */

server.listen(port, () => {
  if(!isProduction) {
      browserSync();
  }
});
server.on('error', onError); 
server.on('listening', onListening);

module.exports = app;
