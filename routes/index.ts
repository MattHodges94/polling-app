import express, { Request, Response } from 'express';
import { default as Poll } from '../models/poll.model';

export default class IndexController {
	public router = express.Router();

	constructor() {
		this.initialiseRoutes();
	}

	public initialiseRoutes() {
		this.router.get('/', this.getIndex);
	}

	getIndex = async (req: Request, res: Response) =>  {
		const polls = await Poll.find().lean();
	
		res.render('index', {
			'polls': polls,
			'user': req.user ? req.user.toObject() : void 0,
			'votedOnCookie': req.cookies.votedOn,
			message: req.flash('homeErrorMessage'),
			successMessage: req.flash('homeSuccessMessage')	
		});
	};
};
