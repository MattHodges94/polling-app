var express = require('express');
var router = express.Router();

// load up the user model
var User = require('../models/user.model');

module.exports = function (passport) {

	router.get('/logout', function (req, res) {
		if (req.user) {
			req.logout();
		}
		res.redirect('/');
	});

	router.get('/login', function (req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login', { 
			'user': req.user ? req.user.toObject() : void 0,
			message: req.flash('loginMessage') 
		}); 
	});
        
	// process the login form
	router.post('/login', loginAndCheckRedirect);

	// show the signup form
	router.get('/signup', function (req, res, next) {
		if (req.user) {
			return res.redirect('/');
		}
		// render the page and pass in any flash data if it exists
		res.render('signup', { 
			'user': req.user,
			message: req.flash('signupMessage') 
		});
	});
        
	// process the signup form
	router.post('/signup', (req, res, next) => {
		if (req.user) {
			return res.redirect('/');
		}

		passport.authenticate('local-signup', {
			successRedirect : '/',
			failureRedirect : '/signup', 
			failureFlash : true
		})(req, res, next);
	});

	router.get('/verify/:uid/:token', function (req, res) {
		var uid = req.params.uid;
		var token = req.params.token;

		// find user from database
		User.findOne({'_id': uid}, async function (err, user) {
			//check if verify token matches param token
			if (!user.local.isVerified && user.local.verifyToken == token) {
				//tokens match, update user to verified
				await User.findOneAndUpdate({'_id': uid}, {'local.isVerified': true});
			}

			res.redirect('/login');
		});
	});

	function loginAndCheckRedirect (req, res, next) {
        if (req.user) {
			return res.redirect('/');
		}
		passport.authenticate('local-login', {
			successRedirect : req.session.returnTo ? req.session.returnTo : '/', 
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		})(req, res, next);
	}

	return router;
};