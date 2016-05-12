let path = require('path'),
fs = require('fs'),
_ = require('underscore'),
partials = require('node-partials'),
fse = require('fs-extra'),
gutil = require('gulp-util'),
del = require('del');

let PluginError = gutil.PluginError;

// Consts
const PLUGIN_NAME = 'gulp-cli-docs';

const templatePath = path.resolve('./src/cli/templates');
const buildPath = path.resolve('./azure/cli/build');
const cliRoot = './azure/cli/azure-cli';

const partial = new partials({
  templatePath: templatePath,
  delimiter: '## ',
  validFileTypes: ['tmpl'],
  commentStartDelimiter: '!##',
  commentEndDelimiter: '##!',
});

const templates = partial.getCompiledTemplates();

function throws(err) {
  if (err) {
    throw new PluginError(PLUGIN_NAME, err);
  }
};

function ensureRelDir(dirPath) {
  return new Promise((resolve, reject) => {
    fse.ensureDir(path.join(buildPath, dirPath), err => {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
};

function readhelp() {
  return new Promise((resolve, reject) => {
    fs.readFile(`${cliRoot}/help.json`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// Build the index
function stage(relPath, content) {
  return new Promise((resolve, reject) => {
    // console.log(`writing to: ${relPath}`)
    fs.writeFile(path.join(buildPath, relPath), content, err => {
      if (err) {
        throws(err);
      } else {
        resolve();
      }
    });
  });
};

function pathFromName(categoryName) {
  return path.join.apply(this, categoryName.split(' '));
};

function stageCommands(cmds, help) {
  return _.map(cmds, cmd => {
    return stage(pathFromName(cmd.name) + '.html',
      templates['layout/layout']({
        pathFromName: pathFromName,
        data: help,
        body: templates['cmd/cmd']({
          data: cmd,
          pathFromName: pathFromName
        })
      }));
  });
}

function stageCategory(category, help) {
  let accumulator = [];
  if(category.categories){
    _.each(category.categories, sub => {
      accumulator.push(Promise.all(_.flatten(stageCategory(sub, help))).then(() => {
        return Promise.all(_.flatten(stageCommands(sub.commands, help)));
      }));
    });
  }

  // accumulator.push(Promise.all(stageCategory(category.commands, help)).then(() => {
  //   return Promise.all(stageCommands(sub.commands, help));
  // }));

  accumulator.unshift(ensureRelDir(pathFromName(category.name)).then(basePath => {

    return stage(path.join(pathFromName(category.name), 'index.html'),
      templates['layout/layout']({
        pathFromName: pathFromName,
        data: help,
        body: templates['group/group']({
          data: category,
          pathFromName: pathFromName
        })
      }))}
    ).then(() => { return Promise.all(_.flatten(stageCommands(category.commands, help))); } )
  );

  return _.flatten(accumulator);
};

function render(data) {
  let help = JSON.parse(data);

  promises = []

  _.each(_.map(help.categories, category => {
    return stageCategory(category, help);
  }), promise => promises.push(promise));

  promises.push(stage('index.html',
    templates['layout/layout']({
      pathFromName: pathFromName,
      data: help,
      body: templates['index/index']({
        data: help.categories,
        pathFromName: pathFromName
      })
    })));

  promises.push(Promise.all(_.flatten(stageCommands(help.commands, help))));

  return Promise.all(_.flatten(promises), throws);
};

function generate(){

  del.sync([path.join(buildPath + '**')]);

  return ensureRelDir('.').then(readhelp).then(render);
}

module.exports = generate;
