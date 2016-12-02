

var gulp = require('gulp'),
    less = require('gulp-less'),
    typescript = require('gulp-typescript'),
    webpack = require('gulp-webpack'),
    browserSync = require('browser-sync');

gulp.task('less', function() {
    return gulp.src('./*.less')
        .pipe(less())
        .pipe(gulp.dest('./'));
});

gulp.task('webpack', ['transpile'], function() {
    return gulp.src(['./*.js', '!./gulpfile.js']).pipe(webpack({
        output: {
            filename: 'index.js',
        },
    })).pipe(gulp.dest('./'));
});

gulp.task('transpile', function() {
    return gulp.src('./*ts').pipe(typescript()).pipe(gulp.dest('./'));
});

gulp.task('serve', ['less', 'webpack'], function() {
    browserSync.init({
        server: {
            baseDir: "./",
            index: "index.html"
        }
    });
    gulp.watch("./*.less", ['less']).on('change', browserSync.reload);
    gulp.watch("./*.ts", ['webpack']).on('change', browserSync.reload);
    gulp.watch(["./index.html"]).on('change', browserSync.reload);
});
