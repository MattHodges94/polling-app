// Dependencies
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var webpack = require('gulp-webpack');
var $ = require('gulp-load-plugins')();

gulp.task('scripts', function () {
  return gulp.src('./public/javascripts/main.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('./'))
    .pipe(livereload())
});

gulp.task('dist', function(){
    gulp.src(['./bin/**/*']).pipe(gulp.dest('./dist/bin'));
    gulp.src(['./config/**/*']).pipe(gulp.dest('./dist/config'));
    gulp.src(['./models/**/*']).pipe(gulp.dest('./dist/models'));
    gulp.src(['./routes/**/*']).pipe(gulp.dest('./dist/routes'));
    gulp.src(['./views/**/*']).pipe(gulp.dest('./dist/views'));
    gulp.src(['./app.js', 'package.json']).pipe(gulp.dest('./dist'));
    gulp.src('./public/images/**/*').pipe(gulp.dest('./dist/public/images'));
    gulp.src('./public/favicon.ico').pipe(gulp.dest('./dist/public'));

    gulp.src('./public/javascripts/main.js')
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(gulp.dest('./dist/'))

    gulp.src('public/stylesheets/style.scss')
       .pipe($.sass({
         outputStyle: 'nested', // libsass doesn't support expanded yet
         precision: 10,
         onError: console.error.bind(console, 'Sass error:')
       }))
       .on('error', function (error) {
         console.log(error.stack);
         this.emit('end');
       })
       .pipe($.postcss([
         require('autoprefixer-core')({browsers: ['last 6 versions']})
       ]))
       .pipe(gulp.dest('./dist/public/stylesheets'))

    
})

 
// Task
gulp.task('serve', ['scripts'], function() {
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
    gulp.watch(['public/javascripts/**/*.js', '!public/javascripts/app.bundle.js', '!public/javascripts/app.bundle.js.map'], ['scripts']);
    
})