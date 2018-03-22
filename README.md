# Azure Reference Documentation
This repo generates and publishes documentation for azure repositories. It's currently in progress...

The project expects the collection of repos to be setup with `repo init -u https://github.com/azure/ref-docs`. 

## Getting started
- `git clone https://github.com/azure/ref-docs`
- `npm install`

## Current Commands
- `gulp --tasks # to see all of the tasks`
- `gulp build # to build the dist directory`
- etc... read the gulpfile

## Publishing steps using docker image (on Windows)
*Note: update default.xml in this repo to reflect correct release tags for each library. Since Documnt DB is still in the private repo their tag shouldbe updated in the gulpfile.js

In PowerShell
1. create a docker image using the Dockerfile in the root folder.
2. create a docker container form that image `docker create -it <IMAGE_NAME>`
3. `docker container ls -a`
```
 CONTAINER ID        IMAGE                                 COMMAND             CREATED             STATUS              PORTS               NAMES
 40243faa06a1        picoded/ubuntu-openjdk-8-jdk   "/bin/bash"         3 months ago        Up 11 minutes                           gifted_pare
```
4. `docker container start 40243faa06a1`

then open a cmd 
1. `docker attach 40243faa06a1`
2. `export PATH=~/bin:$PATH`
3. `export JAVA_TOOL_OPTIONS='-Dfile.encoding=UTF8'`

in the same cmd window configure env variables: 
1. `export GH_TOKEN=...` (put here [github public access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) without any quotes)
2. `git config --global user.email "..."` (your github user email e.g. user@organization.com)
3. `git config --global user.name "..."` (your github user id e.g. user)

*Note: github public access token needs to have access to private repo Azure/azure-documentdb-java-pr_

in the same cmd window build and publish java docs:
1. `git clone https://github.com/Azure/ref-docs.git`
2. `cd ref-docs`
3. `npm install`

***manual fix requred here due to historical issue in the gh-pages branch. In node_modules/gift/lib/commit.js file change the method to this***
```
   Commit.actor = function(line) {
      var actor, epoch, m, ref1;
      ref1 = /^.+? (.*) (\d+) .*$/.exec(line);
      if(ref1 !== undefined && ref1 !== null && ref1.length > 0) {
        m = ref1[0], actor = ref1[1], epoch = ref1[2];
      } else {
        actor="..."; (your github user. e.g. User Muser <user@organization.com>)
        epoch="1518471247"; (magic number)
      }
      return [Actor.from_string(actor), new Date(1000 * +epoch)];
    };
```

4. `gulp publish`
