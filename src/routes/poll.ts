import express, { Request, Response } from 'express';
import { default as Poll } from '../models/poll.model';

export default class PollController {
	public router = express.Router();
	public wss: any;

	constructor(wss: any) {
		this.wss = wss;
		this.initialiseRoutes();
	}

	public initialiseRoutes() {
		this.router.post('/submit/poll/:id', this.submitPollVote);
		this.router.get('/poll/new', this.getPollForm);
		this.router.post('/poll/new', this.createPoll);
	}

	submitPollVote = async (req: Request, res: Response) => {
		if (!req.body.choice) {
			req.flash('homeErrorMessage', 'Your response was not saved, please choose an option before submitting.');
			return res.redirect('/');
		}

		const poll = await Poll.findById(req.params.id) 
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

		await poll.update(poll)

		updateClientPolls(req, poll, this.wss);

		return res.redirect('/');
	}

	getPollForm = (req: Request, res: Response) => {
		if (req.user) {
			res.render('poll', {
				'user': req.user ? req.user.toObject() : void 0,
				message: req.flash('pollErrorMessage')
			});
		} else {
			req.flash('loginMessage', 'You must be logged in to submit a poll.');
			res.redirect('/login');
		}
	}

	createPoll = (req: Request, res: Response) => {
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
	}
}

export const updateVotedOnCookie = (req: express.Request, res: express.Response) => {
    const votedOn = req.cookies.votedOn ? JSON.parse(req.cookies.votedOn) : [];
    votedOn.push(req.params.id);
    res.cookie('votedOn', JSON.stringify(votedOn), {expires: new Date(Date.now() + 999999999)});
}

export const updateUsersVotedOnPoll = (req: express.Request, res: express.Response, poll: any) => {
    if (poll.usersVoted.includes(req.user._id.toString())) {
        return false;
    } else {
        return poll.usersVoted.push(req.user._id.toString());
    }
}

export const updateClientPolls = (req: express.Request, poll: any, wss: any) => {
    let pollUpdate = {
        id: poll._id.toString(),
        result: poll.results[req.body.choice],
        choice: req.body.choice
	};

    wss.clients.forEach(function each (client: any) {
        client.send(JSON.stringify(pollUpdate));
    });
}

export const validatePoll = (req: express.Request, res: express.Response, poll: any) => {
    if (poll.name.length == 0) {
        req.flash('pollErrorMessage', 'Please enter a poll title before submitting');
        return false
    }

    if (poll.choices.length == 0) {
        req.flash('pollErrorMessage', 'Please enter some poll choices before submitting');
        return false
    }

    if (poll.name.length > 46) {
        req.flash('pollErrorMessage', 'Make sure you stick to the character limits!');
        return false
    }

    if (poll.description.length > 54) {
        req.flash('pollErrorMessage', 'Make sure you stick to the character limits!');
        return false
    }

    poll.choices.forEach((choice: any) => {
        if (choice.length > 20) {
            req.flash('pollErrorMessage', 'Make sure you stick to the character limits!');
            return false
        }
    });

    return true;
};
