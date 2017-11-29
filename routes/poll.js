var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResultModel = require('../models/result.model.js');
var PollModel = require('../models/poll.model.js');

module.exports = function(wss) {

    router.post('/submit/poll/:id', function(req, res, next) {

        var newResult = new ResultModel(
            {
                pollId: req.params.id,
                choice: req.body.choice
            })
        if(!req.body.choice){
            req.flash('homeErrorMessage', 'Your response was not saved, please choose an option before submitting.')
            res.redirect('/')
            return next();
        }
            

        PollModel.findById(newResult.pollId, function (err, poll) { 
        
            //checks if logged in user has already voted or if logged out user has already voted through cookies
            if(req.user){
                if(poll.usersVoted.includes(req.user._id.toString())){
                    res.redirect('/')
                    return next()
                } else{
                    poll.usersVoted.push(req.user._id.toString())
                }
            } else{
                if(req.cookies.votedOn){
                    if(JSON.parse(req.cookies.votedOn).includes(req.params.id)){
                        res.redirect('/')
                        return next()
                    }else{
                            var votedOnArray = JSON.parse(req.cookies.votedOn)
                            votedOnArray.push(req.params.id)
                            var votedOnStr = JSON.stringify(votedOnArray);
                            res.cookie('votedOn', votedOnStr, {expire : new Date() + 9999});
                         
                    }
                }else{
                    var votedOnArray = [req.params.id]
                    var votedOnStr = JSON.stringify(votedOnArray);
                    res.cookie('votedOn', votedOnStr, {expire : new Date() + 9999});
                }
            }

            //sets up data to be sent to each client through websockets
            poll.results[newResult.choice] = poll.results[newResult.choice] += 1
            var objToSend = {}
            objToSend['id'] = poll._id.toString()
            objToSend['result'] = poll.results[newResult.choice]
            objToSend['choice'] = newResult.choice

            poll.update(poll, function (err) {
                if (err) return handleError(err);
                
                //sends data to each websockets client
                wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify(objToSend));
                });
                res.redirect('/')
            })
        });
        
    }); 

    router.get('/poll/new', function(req, res, next) {
        if(req.user){
            res.render('poll', {
                "user": req.user,
                 message: req.flash('pollErrorMessage')
            })
        } else {
            req.flash('loginMessage', 'You must be logged in to submit a poll.')
            res.redirect('/login')
        }
    })


    router.post('/poll/new', function(req, res, next) {


    
        var poll = new PollModel(
            {
                name: req.body.title,
                description: req.body.description,
                choices: [],
                results: {},
                usersVoted: [],
                isPremium: req.body.isPremium,
                isApproved: false
            }
        )

            
        req.body.choices.forEach(function(choice) {
            choice = choice.trim()
            if(choice && poll.choices.includes(choice) == false){
                poll.choices.push(choice)
                poll.results[choice] = 0
            }
        }, this);


        // just a bunch of poll validation
        if(poll.name.length == 0){
            req.flash('pollErrorMessage', 'Please enter a poll title before submitting')
            res.redirect('/poll/new')
            return next()
        }

        if(poll.description.length == 0){
            req.flash('pollErrorMessage', 'Please enter a poll description before submitting')
            res.redirect('/poll/new')
            return next()
        }

        if(poll.choices.length == 0){
            req.flash('pollErrorMessage', 'Please enter some poll choices before submitting')
            res.redirect('/poll/new')
            return next()
        }

        if(poll.name.length > 36){
            req.flash('pollErrorMessage', 'Make sure you stick to the character limits!')
            res.redirect('/poll/new')
            return next()
        }

        if(poll.description.length > 48){
            req.flash('pollErrorMessage', 'Make sure you stick to the character limits!')
            res.redirect('/poll/new')
            return next()
        }

        poll.choices.forEach( choice => {
            if(choice.length > 20){
                req.flash('pollErrorMessage', 'Make sure you stick to the character limits!')
                res.redirect('/poll/new')
                return next()
            }
        })
        

        poll.save(function (err, poll) {
            if (err) return console.error(err);
            
            req.flash('homeSuccessMessage', 'Poll submitted for approval')
            res.redirect('/')
        });

    })
    return router;
}

// module.exports = router
