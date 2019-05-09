import * as express from 'express';
import { updateClientPolls, updateUsersVotedOnPoll, updateVotedOnCookie, validatePoll } from './poll-helper';
var router = express.Router();
import { default as Poll } from '../models/poll.model';

module.exports = function (wss: any) {
	router.post('/submit/poll/:id', function (req: express.Request, res: express.Response, next: express.NextFunction) {

		if (!req.body.choice) {
			req.flash('homeErrorMessage', 'Your response was not saved, please choose an option before submitting.');
			return res.redirect('/');
		}

		Poll.findById(req.params.id, function (err: Error, poll: any) { 
			//checks if logged in user has already voted or if logged out user has already voted through cookies
			if (req.user) {
				let redirect = !updateUsersVotedOnPoll(req, res, poll);

				if (redirect) {
					return res.redirect('/')
				}
			} else if (req.cookies.votedOn && JSON.parse(req.cookies.votedOn).includes(req.params.id)) {
				return res.redirect('/');
			} else {
				updateVotedOnCookie(req, res);
			}

			//sets up data to be sent to each client through websockets
			poll.results[req.body.choice] = poll.results[req.body.choice] += 1;

			poll.update(poll, function (err: Error) {
				if (err) return err;

				updateClientPolls(req, poll, wss);

				return res.redirect('/');
			});
		});
        
	}); 

	router.get('/poll/new', function (req: express.Request, res: express.Response) {
		if (req.user) {
			res.render('poll', {
				'user': req.user ? req.user.toObject() : void 0,
				message: req.flash('pollErrorMessage')
			});
		} else {
			req.flash('loginMessage', 'You must be logged in to submit a poll.');
			res.redirect('/login');
		}
	});

	router.post('/poll/new', function (req: express.Request, res: express.Response, next: express.NextFunction) {
		if (!req.user) {
			return res.redirect('/login');
		}

		var poll = new Poll(
			{
				name: req.body.title || '',
				description: req.body.description || '',
				choices: [],
				results: {},
				usersVoted: [],
				isPremium: req.body.isPremium || false,
				isApproved: false
			}
		);
			
		if (req.body.choices) {
			req.body.choices.forEach(function (choice: any) {
				choice = choice.trim();
				if (choice && poll.choices.includes(choice) == false) {
					poll.choices.push(choice);
					poll.results[choice] = 0;
				}
			});
		}

		const isPollValid = validatePoll(req, res, poll);

		if (!isPollValid) {
			return res.redirect('/poll/new');
		}


		poll.save(function (err: Error) {
			if (err) console.error(err);
            
			req.flash('homeSuccessMessage', 'Poll submitted for approval');
			return res.redirect('/');
		});

	});
	return router;
};

// module.exports = router
