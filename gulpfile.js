var gulp = require('gulp'),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber');


var spawn = require('child_process').spawn;

var config = {
	buildPath: './build',
	jsPath: './dev/js/**/*.js',
	viewPath: './dev/views/**/*',
	imgPath: './dev/images/**/*',
	sassPath: './dev/sass/**/*.scss',
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
		.pipe(gulp.dest(config.buildPath + '/public/fonts'));
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
		.pipe(gulp.dest(config.buildPath + '/public/css'));
});

gulp.task('images', function() {
	return gulp.src(config.imgPath).pipe(gulp.dest(config.buildPath + '/public/images'));
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
		.pipe(gulp.dest(config.buildPath + '/public/js'));
});

gulp.task('views', function() {
	return gulp.src(config.viewPath).pipe(gulp.dest(config.buildPath + '/views'));
})

var server = null;
function spawnServer() {
	if(server) {
		console.log('Killing old server');
		server.kill();
	}

	console.log('Spawning new server...');
    server = spawn('node', ['server.js']);

    server.stderr.on('data', (data) => {
		console.log("> " + data);
	});

	server.stdout.on('data', (data) => {
		console.log("> " + data);
	});

	gulp.watch('server.js', function() {
		console.log('Server change detected, spawning new');

		spawnServer();
	});
}

gulp.task('watch', function() {
    gulp.watch(config.sassPath, gulp.parallel('css'));
    gulp.watch(config.viewPath, gulp.parallel('views'));
    gulp.watch(config.jsPath, gulp.parallel('js'));
    gulp.watch(config.imgPath, gulp.parallel('images'));

    spawnServer();
});

gulp.task('default', gulp.series('clean:build', 'bower', 'icons', 'css', 'js', 'images', 'views'));