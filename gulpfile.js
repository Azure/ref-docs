let gulp = require('gulp'),
del = require('del'),
shell = require('gulp-shell'),
ghPages = require('gulp-gh-pages'),
argv = require('yargs').argv,
gulpif = require('gulp-if'),
path = require('path'),
gulpCliDocs = require('./src/cli/tasks/gen-cli');


/// Repo initialiazation, syncronization and cleanup
gulp.task('sync', ['init'], shell.task('repo sync --no-tags -c'));
gulp.task('init', shell.task('repo init -u https://github.com/azure/ref-docs'));
gulp.task('clean', () => {
    return del(['./.repo', './azure', './dist', './.publish', './tmp']);
});

/// Javadoc generation and publication
gulp.task('java:pom', ['sync'], () => {
   return gulp.src('./src/pom.xml').pipe(gulp.dest('./azure/java'));
});
gulp.task('java:build', ['java:pom'], shell.task('mvn package javadoc:aggregate -DskipTests=true -q', {cwd: './azure/java'}));
gulp.task('java:stage', ['java:build'], () => {
    return gulp.src('./azure/java/target/site/apidocs/**/*').pipe(gulp.dest('./dist/java'));
});

// Azure CLI generation and publication
let cliRoot = './azure/cli/azure-cli';
gulp.task('cli:npm:install', ['sync'], shell.task('npm install', {cwd: cliRoot}))
gulp.task('cli:telemetry:off', ['cli:npm:install'], shell.task(`[ -d ${process.env.HOME}/.azure ] || mkdir ${process.env.HOME}/.azure && echo '{"telemetry":false}' > ${process.env.HOME}/.azure/telemetry.json`, {cwd: cliRoot}))
gulp.task('cli:config:arm', ['cli:telemetry:off'], shell.task('node ./bin/azure config set mode arm', {cwd: cliRoot}));
gulp.task('cli:generate:help', ['cli:config:arm'], shell.task('node ./bin/azure help --json > help.json', {cwd: cliRoot}));
gulp.task('cli:build', [], gulpCliDocs);
// 'cli:generate:help'

/// Top level build entry point
gulp.task('stage', ['java:stage']);
gulp.task('publish', ['stage'], () => {
    var options = {};
    if(process.env.GH_TOKEN){
        options.remoteUrl = 'https://' + process.env.GH_TOKEN + '@github.com/azure/ref-docs.git'
    }
    return gulp.src('./dist/**/*').pipe(gulpif(!argv.dryrun, ghPages(options)));
});

gulp.task('default', ['publish']);
