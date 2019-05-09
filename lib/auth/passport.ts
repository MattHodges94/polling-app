import LocalStrategy from 'passport-local';
import { default as User, UserModel } from '../../models/user.model';
import nodemailer from 'nodemailer';
import randomstring from 'randomstring';
import { Request } from 'express';

const credentials = require('../../config/credentials');

module.exports = function (passport: any) {

	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function (user: UserModel, done: any) {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function (id: string, done: any) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================

	passport.use('local-signup', new LocalStrategy.Strategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true //pass back request to the callback
	},
	function (req: Request, email: string, password: string, done: any) {

		// User.findOne wont fire unless data is sent back
		process.nextTick(function () {

			// check to see if the user trying to login already exists
			User.findOne({ 'local.email' :  email }, function (err: any, user: UserModel) {
				// if there are any errors, return the error
				if (err) {
					return done(err);
				}

				// check to see if theres already a user with that email
				if (user) {
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
				} else {

					// if there is no user with that email
					// create the user
					var newUser = (new User() as UserModel);

					// set the user's local credentials
					newUser.local.email = email;
					// @ts-ignore
					newUser.local.password = User.generateHash(password);
					newUser.local.firstName = req.body.fname;
					newUser.local.lastName = req.body.lname;
					newUser.local.isVerified = false;
					newUser.local.verifyToken = randomstring.generate({ length: 64 });

					// save the user
					newUser.save(function (err: any, user: UserModel) {
						if (err) {
							throw err;
						}
                    
						// set up email verification
						var smtpTransport = nodemailer.createTransport({
							host: 'smtp.gmail.com',
							port: 587,
							service: 'Gmail',
							auth: {
								user: credentials.mailerEmail || process.env.MAILER_EMAIL,
								pass: credentials.mailerPassword || process.env.PASSWORD,
							}
						});
            
						// verification object options
						const mailOptions={
							to : email,
							subject : 'Please confirm your Email account for polling-app.mattjhodges.com',
							html : 'Hello ' + newUser.local.firstName + ',<br> Please Click on the link to verify your email.<br><a href=\'' +  credentials.baseUrl || process.env.BASE_URL + 'verify/' + user._id + '/' + user.local.verifyToken + '\'' + '>Click here to verify</a>' 
						};
            
						//send verification email
						smtpTransport.sendMail(mailOptions, function (error, res) {
							if (error) {
								console.log(error);
							} else {
								res.end('sent');
							}
						});

						return done(null, newUser);
					});
				}

			});    

		});

	}));

	passport.use('local-login', new LocalStrategy.Strategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true 
	},
	function (req: Request, email: string, password: string, done: any) { 

		// check to see if the user trying to login already exists
		User.findOne({ 'local.email' :  email }, function (err: any, user: UserModel) {

			// if there are any errors, return the error before anything else
			if (err) {
				return done(err);
			}

			// if no user is found, return the message
			if (!user)
				return done(null, false, req.flash('loginMessage', 'No user found.'));

			// if the user is found but the password is wrong
			if (!user.validPassword(password))
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

			// if user is not verified 
			if (!user.local.isVerified) {
				return done(null, false, req.flash('loginMessage', 'Please verify your email before logging in!'));
			}
                
			// return successful user
			return done(null, user);
		});

	}));
};

