var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var PollModel = require('../models/poll.model.js');
var ResultModel = require('../models/result.model.js');

router.get('/', function(req, res, next) {


      // get all polls from database
      PollModel.find().lean().exec(function (err, poll) {
        if (err){
          throw err;
        } 
        res.render('index', {
          "polls": poll,
          "user": req.user,
          "votedOnCookie": req.cookies.votedOn,
           message: req.flash('homeErrorMessage'),
           successMessage: req.flash('homeSuccessMessage')
           
        })
      })
 

}); 

module.exports = router;
