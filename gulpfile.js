var gulp = require('gulp'),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber');


var spawn = require('child_process').spawn;

var config = {
	buildPath: './build',
	jsPath: './public/js/**/*.js',
	htmlPath: './public/*.html',
	imgPath: './public/images/**/*',
	sassPath: './public/sass/**/*.scss',
	bowerDir: './bower_components'
};

gulp.task('clean:build', function() {
	var rm = require( 'gulp-rm' );

	return gulp.src(config.buildPath + '/**/*', { read: false })
		.pipe( rm() )
});

gulp.task('bower', function() {
	var bower = require('gulp-bower');

	return bower().pipe(gulp.dest(config.bowerDir))
});

gulp.task('icons', function() {
	return gulp.src(config.bowerDir + '/font-awesome/fonts/**.*')
		.pipe(gulp.dest(config.buildPath + '/fonts'));
});

gulp.task('css', function() {
	var cssmin = require('gulp-cssmin'),
		sass = require('gulp-ruby-sass');

	return sass(config.sassPath, {
			style: 'compressed',
			stopOnError: true,
			loadPath: [
				config.sassPath,
				config.bowerDir + '/bootstrap-sass/assets/stylesheets',
				config.bowerDir + '/font-awesome/scss',
			]
		})
		.on("error", notify.onError(function (error) {
			return "Error: " + error.message;
		}))
		.pipe(cssmin())
		.pipe(gulp.dest(config.buildPath + '/css'));
});

gulp.task('images', function() {
	return gulp.src(config.imgPath).pipe(gulp.dest(config.buildPath + '/images'));
});

gulp.task('js', function() {
	var uglify = require('gulp-uglify'),
		jshint = require('gulp-jshint'),
		stylish = require('jshint-stylish'),
		concat = require('gulp-concat');

	return gulp.src(config.jsPath)
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(concat('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.buildPath + '/js'));
});

gulp.task('html', function() {
	return gulp.src(config.htmlPath).pipe(gulp.dest(config.buildPath));
})

gulp.task('watch', function() {
    gulp.watch(config.sassPath, ['css']);
    gulp.watch(config.htmlPath, ['html']);
    gulp.watch(config.jsPath, ['js']);
    gulp.watch(config.imgPath, ['images']);

    console.log('Spawning server');
    var s = spawn('node', ['server.js']);

	s.stdout.on('data', (data) => {
		console.log("> " + data);
	});
});

gulp.task('default', gulp.series('clean:build', 'bower', 'icons', 'css', 'js', 'images', 'html'));