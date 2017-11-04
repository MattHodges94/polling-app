var mongoose = require('mongoose');
var pollSchema = new mongoose.Schema({
    "name": String,
    "description": String,
    "choices": Array,
    "results": Object,
    "usersVoted": Array,
    "isPremium": Boolean
});

module.exports = mongoose.model( "PollModel", pollSchema ) 