var mongoose = require('mongoose');
var resultSchema = new mongoose.Schema({
	'pollId': String,
	'choice': String
});

module.exports = mongoose.model( 'ResultModel', resultSchema ); 