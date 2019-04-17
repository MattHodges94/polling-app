// Dependencies
var gulp = require('gulp');
var webpack = require('gulp-webpack');
var $ = require('gulp-load-plugins')();

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
