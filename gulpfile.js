// Dependencies
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('dist', function () {
	gulp.src(['./src/views/**/*']).pipe(gulp.dest('./dist/src/views'));
	gulp.src(['package.json']).pipe(gulp.dest('./dist'));
	gulp.src('./public/images/**/*').pipe(gulp.dest('./dist/public/images'));
	gulp.src('./public/favicon.ico').pipe(gulp.dest('./dist/public'));

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
		.pipe(gulp.dest('./dist/public/stylesheets'));
});
