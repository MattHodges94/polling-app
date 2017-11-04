var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var PollModel = require('../models/poll.model.js');
var ResultModel = require('../models/result.model.js');
/* GET home page. */
router.get('/', function(req, res, next) {


      // var poll = new PollModel(
      //     {
      //       name: "test",
      //       description: "test poll",
      //       choices: ["choice 1", "choice 2", "choice 3"],
      //       results: {"choice 1": 0, "choice 2": 0, "choice 3": 0},
      //       isPremium: true
      //   }
      // )

      // poll.save(function (err, poll) {
      //   if (err) return console.error(err);
      // });



      console.log(req.cookies.votedOn)

      PollModel.find().lean().exec(function (err, poll) {
        poll.forEach(function(element) {
          if(req.user){
          console.log(element.usersVoted[0] == req.user._id)
          }
        }, this);
        if (err) throw err;
        res.render('index', {
          "polls": poll,
          "user": req.user,
          "votedOnCookie": req.cookies.votedOn
        })
      })
 

}); 

module.exports = router;
