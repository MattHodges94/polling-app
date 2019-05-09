import * as express from 'express';

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
}