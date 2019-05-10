import express, { Request, Response, NextFunction } from 'express';
import { default as User, UserModel } from '../models/user.model';

export default class LoginController {
	public router = express.Router();
	public passport: any;

	constructor(passport: any) {
		this.passport = passport;
		this.initialiseRoutes();
	}

	public initialiseRoutes() {
		this.router.get('/logout', this.logout);
		this.router.get('/login', this.getLoginForm);
		this.router.post('/login', this.login);
		this.router.get('/signup', this.getSignupform);
		this.router.post('/signup', this.signup);
		this.router.get('/verify/:uid/:token', this.verifyUser);
	}

	logout = (req: Request, res: Response) => {
		if (req.user) {
			req.logout();
		}
		res.redirect('/');
	};

	getLoginForm = (req: Request, res: Response) => {
		// render the page and pass in any flash data if it exists
		res.render('login', { 
			'user': req.user ? req.user.toObject() : void 0,
			message: req.flash('loginMessage') 
		}); 
	};
        
	login = (req: Request, res: Response, next: NextFunction) => loginAndCheckRedirect(req, res, next, this.passport);

	getSignupform = (req: Request, res: Response) => {
		if (req.user) {
			return res.redirect('/');
		}
		// render the page and pass in any flash data if it exists
		res.render('signup', { 
			'user': req.user,
			message: req.flash('signupMessage') 
		});
	};
        
	signup = (req: Request, res: Response, next: NextFunction) => {
		if (req.user) {
			return res.redirect('/');
		}

		this.passport.authenticate('local-signup', {
			successRedirect : '/',
			failureRedirect : '/signup', 
			failureFlash : true
		})(req, res, next);
	};

	verifyUser = (req: Request, res: Response) => {
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
	};
}

export const loginAndCheckRedirect = (req: Request, res: Response, next: NextFunction, passport: any) => {
	if (req.user) {
		return res.redirect('/');
	}
	passport.authenticate('local-login', {
		successRedirect : req.session.returnTo ? req.session.returnTo : '/', 
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	})(req, res, next);
};
