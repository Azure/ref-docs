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

// Pull doc db private repo
gulp.task('docdb', ['sync'], shell.task('git clone https://' + process.env.GH_TOKEN + ':x-oauth-basic@github.com/azure/azure-documentdb-java-pr.git documentdb', {cwd: './azure/java'}));

/// Javadoc generation and publication
gulp.task('java:pom', ['docdb'], function(){
   return gulp.src('./src/pom.xml').pipe(gulp.dest('./azure/java')); 
});
gulp.task('java:build', ['java:pom'], shell.task('mvn package javadoc:aggregate -DskipTests=true -q', {cwd: './azure/java'}));
gulp.task('java:stage', ['java:build'], function(){
    return gulp.src('./azure/java/target/site/apidocs/**/*').pipe(gulp.dest('./dist/java')); 
});

/// Top level build entry point
gulp.task('stage', ['java:stage']);
gulp.task('publish', ['stage'], function(){
    var options = {};
    if(process.env.GH_TOKEN){
        options.remoteUrl = 'https://' + process.env.GH_TOKEN + '@github.com/azure/ref-docs.git'  
    }
    return gulp.src('./dist/**/*').pipe(gulpif(!argv.dryrun, ghPages(options)));
});

gulp.task('default', ['publish']);