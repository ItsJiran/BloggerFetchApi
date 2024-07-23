const gulp = require('gulp');
const concat = require('gulp-concat');
const { watch } = require('gulp');

function build() {
    return gulp.src([
        'src/functions.js',
        'src/builder.js',
        'src/entity.js',
        'src/info.js',
        'src/queries.js',
        'src/index.js',
        // etc...
    ])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('dist'));
}

gulp.task('build', function () {
    return build();
});


gulp.task('watch', function () {
    watch(['src/*.js'], function (cb) {
        build();
        cb();
    });
});
