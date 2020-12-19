const { src, dest, watch, parallel, series } = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const del = require('del');

const browserSync = require('browser-sync').create();

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'src/'
    }
  });
}

function cleanBuild() {
  return del('build');
}

function images() {
  return src('src/img/**/*').pipe(imagemin(
    [
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]
    ))
    .pipe(dest('build/img'));
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'src/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('src/js'))
  .pipe(browserSync.stream())
}

function styles() {
  return src('src/less/style.less')
  .pipe(less())
  .pipe(csso())
  .pipe(concat('style.min.css')).pipe(autoprefixer({
    overrideBrowserslist: ['last 10 version'],
    grid: true
  }))
  .pipe(dest('src/css'))
  .pipe(browserSync.stream())
}

function build() {
  return src([
    'src/css/style.min.css',
    'src/fonts/**/*',
    'src/js/main.min.js',
    'src/*.html'
  ], {base: 'src'})
  .pipe(dest('build'))
}

function watching() {
  watch(['src/less/**/*.less'], styles);
  watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts);
  watch(['src/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.build = build;

exports.build = series(cleanBuild, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);