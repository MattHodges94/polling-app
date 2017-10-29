var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');

var app = express();

var url = 'mongodb://localhost:27017/polling-app';
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var passport = require('passport');
var session = require('express-session')
var flash = require('connect-flash')

var index = require('./routes/index');
var poll = require('./routes/poll');
var login = require('./routes/login')(passport);

mongoose.connect(url)

require('./config/passport')(passport); // pass passport for configuration

 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 

// passport config
app.use(session({ secret: 'enter-new-key-here' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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

module.exports = app;
