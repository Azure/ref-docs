var gulp = require('gulp');
var del = require('del');
var shell = require('gulp-shell');
var ghPages = require('gulp-gh-pages');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var spawn = require('child_process').spawn;

// Pull doc db private repo v.1.15.0
gulp.task('docdb', function () {
    /*shell.task('git clone https://' + process.env.GH_TOKEN + ':x-oauth-basic@github.com/azure/azure-documentdb-java-pr.git documentdb', {cwd: './azure/java'})*/
    spawn('mkdir -p ./azure/java', [], { shell: true, stdio: "inherit" });
    spawn('git clone https://' + process.env.GH_TOKEN + ':x-oauth-basic@github.com/azure/azure-documentdb-java-pr.git documentdb', [], { cwd: './azure/java', shell: true, stdio: "inherit" });
    spawn('git checkout -b 1.15.0 1.15.0', [], { cwd: './azure/java/documentdb', shell: true, stdio: "inherit" });
});

/// Repo initialiazation, syncronization and cleanup
gulp.task('init', ['docdb'], shell.task('repo init -u https://github.com/azure/ref-docs'));
gulp.task('clean', function(){
    return del(['./.repo', './azure', './dist', './.publish']);
});
gulp.task('sync', ['init'], shell.task('repo sync --no-tags -c'));

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
gulp.task('publish', ['stage'], function(){
    var options = {};
    if(process.env.GH_TOKEN){
        options.remoteUrl = 'https://' + process.env.GH_TOKEN + '@github.com/azure/ref-docs.git'  
    }
    return gulp.src('./dist/**/*').pipe(gulpif(!argv.dryrun, ghPages(options)));
});

gulp.task('default', ['publish']);