'use strict';

// Include gulp
var gulp = require('gulp');

// Include Our Plugins

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var maps = require('gulp-sourcemaps');

// var paths = {
//   scripts: ['src/js/*.js', '!client/external/**/*.coffee'],
//   images: 'client/img/**/*'
// };

var scripts =  ['src/styles/*.js'];

// Lint Task
gulp.task('lint', function() {
  var task = scripts.map(function(script) {
    return gulp.src(script)
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
  })
});

// Compile Our sass
gulp.task('sass', function() {
  return gulp.src('src/styles/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/stylesheets'))
    .pipe(gulp.dest('client/public/stylesheets'))
    .pipe(autoprefixer({
        browsers: ['> 5%'],
        cascade: false
    }))
    .pipe(gulp.dest('public/stylesheets'))
    .pipe(gulp.dest('client/public/stylesheets'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src('public/**/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('public/javascripts/'))
    .pipe(rename('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/javascripts/'));
});

// Watch Files For Changes
gulp.task('watch', ['sass'], function() {
  gulp.watch('src/scripts/*.js', ['lint', 'scripts']);
  gulp.watch('src/**/*.scss', ['sass']);
});

// Default task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);
