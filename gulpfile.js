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
const gulpIf = require('gulp-if');
const csso = require('gulp-csso');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const del = require('del');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function isChangeIndexHtml(file) {
  if(file.basename === 'index.html' && !isDevelopment) return true;

}


gulp.task('assets', function() {
  return gulp.src('source/assets/**/*.*', {since: gulp.lastRun('assets')})
    .pipe(gulpIf(isChangeIndexHtml, through2(function (file, enc, cb) {
      file.contents = replace(file.contents, 'href="style.css"', 'href="style.min.css"');
      file.stat.mtime = new Date();
      cb(null, file);
    })))
    .pipe(newer('build'))
    .pipe(debug({title: 'assets'}))
    .pipe(gulp.dest('build'))
});

gulp.task('styles', function() {

  return combiner(
    gulp.src('source/styles/style.scss'),
    gulpIf(isDevelopment, sourcemaps.init()),
    sass(),
    through2(function (file, enc, cb) {
      file.contents = replace(file.contents, 'background-image: url("./', 'background-image: url("img/');
      cb(null, file);
    }),
    postcss([autoprefixer()]),
    gulpIf(isDevelopment, sourcemaps.write(), combiner(
      csso(),
      rename("style.min.css"),
    )),
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
  return gulp.src('source/styles/**/*.{png,jpg,webp}', {since: gulp.lastRun('assets:styles')})
    .pipe(rename( function(path) {
      path.dirname = '.';
    }))
    .pipe(newer('build/img'))
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(debug({title: 'assets:styles'}))
    .pipe(gulp.dest('build/img'))
});

gulp.task('api', function() {
  return gulp.src('source/api/**/*.*', {base: 'source'})
    .pipe(newer('build'))
    .pipe(gulp.dest('build'))
});

gulp.task('clear', function(cb) {
  if(isDevelopment) {
    cb()} else  {
      return del('build');
    }
});

gulp.task('webp', function() {
  return gulp.src('source/styles/**/*.{png,jpg}')
    .pipe(webp({quality: 100}))
    .pipe(gulp.dest('source/styles'))
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
  gulp.watch('source/api/**/*.*', gulp.series('api'))
});

gulp.task('build', gulp.series('clear', gulp.parallel('styles', 'assets', 'assets:styles', 'api')));
gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));
