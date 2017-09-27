// Dependencies
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
 
var webpack = require('gulp-webpack');

gulp.task('bundle', function () {
  return gulp.src('./public/javascripts/main.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('./'))
    .pipe(livereload())
});

 
// Task
gulp.task('serve', ['bundle'], function() {
	// listen for changes
	livereload.listen();
	// configure nodemon
	nodemon({
		// the script to run the app
        script: './bin/www',
        ext: 'ejs js scss png jpeg jpg svg ttf otf',
        watch: './',
        ignore: "public/javascripts/**/*.js"
	}).on('restart', function(){
		// when the app has restarted, run livereload.
		gulp.src('./bin/www')
			.pipe(livereload())
    })
    gulp.watch(['public/javascripts/**/*.js', '!public/javascripts/app.bundle.js', '!public/javascripts/app.bundle.js.map'], ['bundle']);
    
})