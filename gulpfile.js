var gulp = require('gulp');
var ts = require('gulp-typescript');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('default', ['babel']);

gulp.task('ts', function () {
	var tsResult = tsProject.src(['src/**.ts', 'typings/**.ts'])
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject));
	
	//var tsResult = gulp.src(['src/**.ts', 'typings/**.ts'])
	//.pipe(ts({
	//	out: 'app.js',
	//	target: 'ES6',
	//	moduleResolution: 'node'
	//})).pipe(gulp.dest('dist'));
	
	return tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest('build'));

});

gulp.task('babel', ['ts'], function () {
	return gulp.src(['build/**.js', 'build/**/*.js'])
		.pipe(sourcemaps.init())
		.pipe(babel({ "modules": "commonStrict" }))
		.pipe(sourcemaps.write('.', { sourceRoot: '/Users/Alex/Desktop/hitabot-master/src' }))
		.pipe(gulp.dest('dist'));
});
