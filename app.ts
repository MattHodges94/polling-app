import https from 'https';
import http from'http';
import express from 'express';
import fs from 'fs';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
// @ts-ignore
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import flash from 'connect-flash';

const credentials = require('./config/credentials');

import { Server } from 'http';
interface Error {
	status?: number;
	message?: string;
	syscall?: string;
	code?: string;
}

const app = express(),
	port = Number(process.env.PORT) || 3000;

app.set('port', port);

const isProduction = 'production' === process.env.NODE_ENV;

let server: Server;

if (isProduction) {
	server = https.createServer({key: fs.readFileSync(credentials.key, 'utf8'), cert: fs.readFileSync(credentials.cert, 'utf8')}, app);
} else {
	server = http.createServer(app);
}

const WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({server});

import IndexController from './src/routes/index';
import PollController from './src/routes/poll';
import LoginController from './src/routes/login';

const index = new IndexController();
const poll = new PollController(wss);
const login = new LoginController(passport);

if (process.env.NODE_ENV !== 'test') {
	mongoose.connect(credentials.databaseUrl || process.env.DATABASE_URL);
}

app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 

require('./lib/auth/passport')(passport);
app.use(session({ secret: credentials.passportSecret || process.env.PASSPORT_SECRET })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(index.router);
app.use(poll.router);
app.use(login.router);

// catch 404 and forward to error handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	var err = new Error('Not Found');
	(err as Error).status = 404;
	next(err);
});

app.use((err: Error, req: express.Request, res: express.Response) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.render('error');
});

const onError = (error: Error) => {
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

const onListening = () => {
	var addr = server.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	console.log('Listening on ' + bind);
}

const browserSync = () => {
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

server.listen(port, () => {
	if (!isProduction) {
		browserSync();
	}
});
server.on('error', onError); 
server.on('listening', onListening);

export default app;
