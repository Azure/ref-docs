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
gulp.task('init', shell.task('eng/pipelines/scripts/repo init -u https://github.com/azure/ref-docs'));
gulp.task('sync', ['init'], shell.task('eng/pipelines/scripts/repo sync --no-tags -c'));

/// Javadoc generation and publication
gulp.task('java:pom', ['sync'], function(){
   return gulp.src('./src/pom.xml').pipe(gulp.dest('./azure/java')); 
});
gulp.task('java:build', ['java:pom'], shell.task('mvn package javadoc:aggregate -DskipTests=true -q', {cwd: './azure/java'}));
gulp.task('java:stage', ['java:build'], function(){
    return gulp.src('./azure/java/target/site/apidocs/**/*').pipe(gulp.dest('./dist/java')); 
});

/// Top level build entry point
gulp.task('stage', ['java:stage']);
gulp.task('publish:ref-docs', ['stage'], function(){
    var options = {};
    if(process.env.GH_TOKEN){
		console.log("Got GH_TOKEN");
        options.remoteUrl = 'https://' + process.env.GH_TOKEN + '@github.com/azure/ref-docs.git';
    }
	console.log(options.remoteUrl);
    return gulp.src('./dist/**/*').pipe(gulpif(!argv.dryrun, ghPages(options)));
});

gulp.task('publish:sdk', ['stage'], function(){
    var options = {};
    if(process.env.GH_TOKEN){
        options.remoteUrl = 'https://' + process.env.GH_TOKEN + '@github.com/azure/azure-sdk-for-java.git'  
    }
    return gulp.src('./dist/java/**/*').pipe(gulpif(!argv.dryrun, ghPages(options)));
});

gulp.task('publish', ['publish:ref-docs', 'publish:sdk']);

gulp.task('default', ['publish']);
