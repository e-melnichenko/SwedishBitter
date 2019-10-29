'use strict';

const replace = require('buffer-replace');
const through2 = require('through2').obj;
const combiner = require('stream-combiner2').obj;
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const debug = require('gulp-debug');
const rename = require('gulp-rename');
const newer = require('gulp-newer');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();


gulp.task('assets', function() {
  return gulp.src('source/assets/**/*.*', {since: gulp.lastRun('assets')})
    .pipe(debug({title: 'assets1'}))
    .pipe(newer('build'))
    .pipe(debug({title: 'assets2'}))
    .pipe(gulp.dest('build'))
});

gulp.task('styles', function() {

  return combiner(
    gulp.src('source/styles/style.scss'),
    sourcemaps.init(),
    sass(),
    through2(function (file, enc, cb) {
      file.contents = replace(file.contents, 'background-image: url("./', 'background-image: url("img/');
      cb(null, file);
    }),
    sourcemaps.write(),
    debug({title: 'styles'}),
    gulp.dest('build')
  ).on('error', notify.onError(function(err) {
      return {
        title: 'styles',
        message: err.message
      }
  }))

});

gulp.task('assets:styles', function() {
  return gulp.src('source/styles/**/*.png', {since: gulp.lastRun('assets:styles')})
    .pipe(rename( function(path) {
      path.dirname = '.';
    }))
    .pipe(newer('build/img'))
    .pipe(debug({title: 'assets:styles'}))
    .pipe(gulp.dest('build/img'))
});

gulp.task('server', function() {
  browserSync.init({
    server: 'build'
  })

  browserSync.watch('build/**/*.*').on('change', browserSync.reload)
});

gulp.task('watch', function() {
  gulp.watch('source/styles/**/*.scss', gulp.series('styles'))
  gulp.watch('source/assets/**/*.*', gulp.series('assets'))
  gulp.watch('source/styles/**/*.png', gulp.series('assets:styles'))
});

gulp.task('build', gulp.parallel('styles', 'assets', 'assets:styles'));
gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));
