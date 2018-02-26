var gulp = require('gulp');
var del = require('del');
var shell = require('gulp-shell');
var ghPages = require('gulp-gh-pages');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var exec = require('child_process').exec;

gulp.task('clean', function(){
    return del(['./.repo', './azure', './dist', './.publish']);
});

/// Repo initialiazation, syncronization and cleanup
gulp.task('init', shell.task('repo init -u https://github.com/azure/ref-docs'));
gulp.task('sync', ['init'], shell.task('repo sync --no-tags -c'));

// Pull doc db private repo v.1.15.0
gulp.task('docdb', ['sync'], function () {
	exec('git clone https://' + process.env.GH_TOKEN + ':x-oauth-basic@github.com/azure/azure-documentdb-java-pr.git documentdb', { cwd: './azure/java'}, function(err, stdout, stderr) {
		exec('git checkout -b 1.15.0 1.15.0', { cwd: './azure/java/documentdb'});
	});
});

/// Javadoc generation and publication
gulp.task('java:pom', ['sync', 'docdb'], function(){
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