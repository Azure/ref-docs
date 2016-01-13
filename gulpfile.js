var gulp = require('gulp'),
del = require('del'),
shell = require('gulp-shell'),
ghPages = require('gulp-gh-pages'),
argv = require('yargs').argv,
gulpif = require('gulp-if');

/// Repo initialiazation, syncronization and cleanup
gulp.task('sync', ['init'], shell.task('repo sync --no-tags -c'));
gulp.task('init', shell.task('repo init -u https://github.com/azure/ref-docs'));
gulp.task('clean', function(){
    return del(['./.repo', './azure', './dist', './.publish']);
});

/// Javadoc generation and publication
gulp.task('java:pom', ['sync'], function(){
   return gulp.src('./src/pom.xml').pipe(gulp.dest('./azure/java')); 
});
gulp.task('java:build', ['java:pom'], shell.task('mvn package javadoc:aggregate -DskipTests=true -q', {cwd: './azure/java'}));
gulp.task('java:stage', ['java:build'], function(){
    return gulp.src('./azure/java/target/site/apidocs/**/*').pipe(gulp.dest('./dist/java')); 
});

/// Top level build entry point
gulp.task('build', ['java:build', 'node:build']);
gulp.task('publish', ['build'], function(){
    return gulp.src('./dist/**/*').pipe(gulpif(!argv.dryrun, ghPages()));
});

gulp.task('default', ['publish']);