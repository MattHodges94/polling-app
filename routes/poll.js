var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResultModel = require('../models/result.model.js');
var PollModel = require('../models/poll.model.js');

/* POST poll response */
router.post('/submit/poll/:id', function(req, res, next) {
    var resultObj = {}

    if(!req.user){
        if(req.cookies.votedOn){
            var votedOnArray = JSON.parse(req.cookies.votedOn)
            votedOnArray.push(req.params.id)
            var votedOnStr = JSON.stringify(votedOnArray);
            res.cookie('votedOn', votedOnStr, {expire : new Date() + 9999});
        } else {
            var votedOnArray = [req.params.id]
            console.log(votedOnArray)
            var votedOnStr = JSON.stringify(votedOnArray);
            res.cookie('votedOn', votedOnStr, {expire : new Date() + 9999});
        }
    }

    var newResult = new ResultModel(
        {
            pollId: req.params.id,
            choice: req.body.choice
        })

    
    PollModel.findById(newResult.pollId, function (err, poll) {  
        if(req.user){
            poll.usersVoted.push(req.user._id.toString())
        }

        poll.results[newResult.choice] = poll.results[newResult.choice] += 1

        poll.update(poll, function (err) {
            if (err) return handleError(err);
            res.redirect('/')
        })
    });
    
    
}); 

router.get('/poll/new', function(req, res, next) {
    if(req.user){
        res.render('poll')
    } else {
        req.session.returnTo = req.path;
        res.render('login', { message: 'Sorry, you must be logged in to submit a poll.' })
    }
})


router.post('/poll/new', function(req, res, next) {


    console.log(req.body)
      var poll = new PollModel(
          {
            name: req.body.title,
            description: req.body.description,
            choices: [],
            results: {},
            usersVoted: [],
            isPremium: req.body.isPremium
        }
      )
        
      console.log(poll)
        
      req.body.choices.forEach(function(choice) {
          choice = choice.trim()
          if(choice && poll.choices.includes(choice) == false){
            poll.choices.push(choice)
            poll.results[choice] = 0
          }
      }, this);
      

      poll.save(function (err, poll) {
        if (err) return console.error(err);

        res.redirect('/')
      });

})

module.exports = router;
