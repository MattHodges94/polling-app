var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResultModel = require('../models/result.model.js');
var PollModel = require('../models/poll.model.js');

/* GET home page. */
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
        })
    });
    

    res.redirect('/')
    
}); 

module.exports = router;
