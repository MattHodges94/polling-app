var express = require('express');
var router = express.Router();

// load up the user model
var User = require('../models/user.model');

module.exports = function (passport) {

	router.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	router.get('/login', function (req, res) {
        
		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { 
			'user': req.user,
			message: req.flash('loginMessage') 
		}); 
	});
        
	// process the login form
	router.post('/login', loginAndCheckRedirect);

	// show the signup form
	router.get('/signup', function (req, res, next) {
		if (req.user) {
			res.redirect('/');
			return next();
		}
        
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { 
			'user': req.user,
			message: req.flash('signupMessage') 
		});
	});
        
	// process the signup form
	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/signup', 
		failureFlash : true
	}));

	router.get('/verify/:uid/:token', function (req, res) {
		var uid = req.params.uid;
		var token = req.params.token;

		// find user from database
		User.findOne({'_id': uid}, function (err, user) {
			//check if verify token matches param token
			if (user.local.verifyToken == token) {
				//tokens match, update user to verified
				User.findOneAndUpdate({'_id': uid}, {'local.isVerified': true}, function (err, resp) {
					console.log('The user has been verified!');
				});

				res.redirect('/login');
			}
		});
	});

	function loginAndCheckRedirect (req, res, next) {
        
		passport.authenticate('local-login', {
			successRedirect : req.session.returnTo ? req.session.returnTo : '/', 
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		})(req, res, next);
	}

	return router;
};