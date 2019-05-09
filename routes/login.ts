import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import { default as User, UserModel } from '../models/user.model';

module.exports = function (passport: any) {

	router.get('/logout', function (req: Request, res: Response) {
		if (req.user) {
			req.logout();
		}
		res.redirect('/');
	});

	router.get('/login', function (req: Request, res: Response) {
		// render the page and pass in any flash data if it exists
		res.render('login', { 
			'user': req.user ? req.user.toObject() : void 0,
			message: req.flash('loginMessage') 
		}); 
	});
        
	// process the login form
	router.post('/login', loginAndCheckRedirect);

	// show the signup form
	router.get('/signup', function (req: Request, res: Response) {
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
	router.post('/signup', (req: Request, res: Response, next: NextFunction) => {
		if (req.user) {
			return res.redirect('/');
		}

		passport.authenticate('local-signup', {
			successRedirect : '/',
			failureRedirect : '/signup', 
			failureFlash : true
		})(req, res, next);
	});

	router.get('/verify/:uid/:token', function (req: Request, res: Response) {
		var uid = req.params.uid;
		var token = req.params.token;

		// find user from database
		User.findOne({'_id': uid}, async function (err: any, user: UserModel) {
			//check if verify token matches param token
			if (!user.local.isVerified && user.local.verifyToken == token) {
				//tokens match, update user to verified
				await User.findOneAndUpdate({'_id': uid}, {'local.isVerified': true});
			}

			res.redirect('/login');
		});
	});

	function loginAndCheckRedirect (req: Request, res: Response, next: NextFunction) {
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