require('dotenv').config();
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const pug = require('gulp-pug');
const notify = require('gulp-notify');
const combiner = require('stream-combiner2').obj;
const htmlmin = require('gulp-htmlmin');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
const json = require('rollup-plugin-json');

// Clean
gulp.task('clean', () => del('dist'));

// HTML
gulp.task('html', () => (
  combiner(
    gulp.src('src/templates/pages/*.pug'),
    pug(),
    htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
    }),
    gulp.dest('dist'),
  ).on('error', notify.onError())
));

// Styles
gulp.task('styles', () => (
  combiner(
    gulp.src('src/styles/main.scss'),
    sourcemaps.init(),
    sass(),
    postcss(),
    sourcemaps.write('.'),
    gulp.dest('dist/styles'),
  ).on('error', notify.onError())
));

// Scripts
gulp.task('scripts', () => (
  combiner(
    gulp.src('src/scripts/main.js', { since: gulp.lastRun('scripts') }),
    sourcemaps.init(),
    rollup({ plugins: [json(), babel(), resolve(), commonjs(), terser()] }, 'umd'),
    sourcemaps.write('.'),
    gulp.dest('dist/scripts'),
  ).on('error', notify.onError())
));

// Watch
gulp.task('watch', () => {
  gulp.watch('src/styles/**/*.scss', gulp.series('styles'));
  gulp.watch('src/scripts/**/*.js', gulp.series('scripts'));
  gulp.watch('src/templates/**/*.pug', gulp.series('html'));
});


// Static server
gulp.task('server', () => {
  browserSync.init({
    server: './dist',
    open: false,
    port: process.env.PORT,
    notify: false,
  });
  browserSync.watch('./dist/**', (event) => {
    if (event === 'change') {
      browserSync.reload();
    }
  });
});

// Build
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'styles', 'scripts')));

// Dev
gulp.task('dev', gulp.series('build', gulp.parallel('server', 'watch')));
