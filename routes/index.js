var express = require('express');
var router = express.Router();
var PollModel = require('../models/poll.model.js');

router.get('/', function (req, res) {
	// get all polls from database
	PollModel.find().lean().exec(function (err, poll) {
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
