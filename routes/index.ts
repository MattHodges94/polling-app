import express from 'express';
import { default as Poll } from '../models/poll.model';
const router = express.Router();

router.get('/', function (req: express.Request, res: express.Response) {
	// get all polls from database
	Poll.find().lean().exec(function (err, poll) {
		if (err) {
			throw err;
		}

		res.render('index', {
			'polls': poll,
			'user': req.user ? req.user.toObject() : void 0,
			'votedOnCookie': req.cookies.votedOn,
			message: req.flash('homeErrorMessage'),
			successMessage: req.flash('homeSuccessMessage')	
		});
	});
}); 

module.exports = router;
