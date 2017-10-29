var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResultModel = require('../models/result.model.js');
var PollModel = require('../models/poll.model.js');

/* POST poll response */
router.post('/submit/poll/:id', function(req, res, next) {
    var resultObj = {}

    var newResult = new ResultModel(
        {
            pollId: req.params.id,
            choice: req.body.choice
        })

    
    PollModel.findById(newResult.pollId, function (err, poll) {  
        
        data = poll
        data.results[newResult.choice] = poll.results[newResult.choice] += 1
        console.log(data)        
        console.log(poll)

        poll.update(data, function (err) {
            if (err) return handleError(err);
            res.redirect('/')
        })
    });
    
    
}); 

router.get('/poll/new', function(req, res, next) {
    if(req.user){
        res.render('poll')
    } else {
        res.redirect('/')
    }
})

module.exports = router;
