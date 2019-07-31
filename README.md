# Azure Reference Documentation

This repo generates and publishes documentation for azure repositories. It's currently in progress...

The project expects the collection of repos to be setup with `repo init -u https://github.com/azure/ref-docs`.


## Current publishing steps
* Make sure you update the version [here](https://github.com/Azure/ref-docs/blob/master/default.xml#L8) to your current release version
  * NOTE: this ***has*** to be done on the main Github repo.
* Once the above change is merged into master, run the following ADO pipeline : https://dev.azure.com/azure-sdk/internal/_build?definitionId=703
  * Run it on the branch "master"

### Validate that the docs got updates
Once the pipeline completes, validate that the ref docs are updates at the following locations:
* http://azure.github.io/ref-docs/java/
* http://azure.github.io/azure-sdk-for-java
* https://azure.github.io/azure-libraries-for-java

#### Note
- Sometimes because of your browser cache you won't see the update, if not, try opening it in incognito


## Legacy publishing steps
### Required setup

- Make sure you have Docker installed
  1. If you are having trouble running the docker command after installation, one problem could be that visualization is not enabled. If so, restart your computer and upon rebooting, [enter BIOS setup](https://www.makeuseof.com/tag/enter-bios-computer/) and enable visualization
- Need access to this repo as a contributor.
  1. Go to https://repos.opensource.microsoft.com/ 
  2. Join https://repos.opensource.microsoft.com/teams?q=adx-sdk-team
- Need access to the azureclidev.azurecr.io docker repo.
  1. `az account set --subscription "Azure SDK Infrastructure"`
  2. `az acr login --name azureclidev`

### Publishing steps using a docker image (on Windows)

On the main Github ref-docs repo

1. Make sure you update the version [here](https://github.com/Azure/ref-docs/blob/master/default.xml#L8) to your current release version
  i. NOTE: this ***has*** to be done on the main Github repo.

In PowerShell

1. `docker create -t azureclidev.azurecr.io/azuresdk-javadoc`
2. `docker container ls -a`
3. From the previous command, get the container id that correspons to the javadoc image you just created.
4. `docker container start {container id you just copied}`

Then open a cmd terminal

1. `docker attach {container id you just copied}`

Now you wil be in the docker image environment.

In the same cmd window configure these environment variables

1. `export PATH=~/bin:$PATH`
2. `export JAVA_TOOL_OPTIONS='-Dfile.encoding=UTF8'`
3. `export GH_TOKEN=...` (put your [Github public access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) here without any quotes. Make sure it has full repo access).

Configure your git credentials and clone git in your docker environment

1. `git config --global user.email "{your github user email e.g. user@organization.com}"`
2. `git config --global user.name "{your github user id e.g. user}"`
3. `git clone https://github.com/Azure/ref-docs.git`
4. `cd ref-docs`
5. `npm install`

Manual fix required here due to historical issue in the gh-pages branch. In node_modules/gift/lib/commit.js file change the method to the following.

``` javascript
Commit.actor = function(line) {
      var actor, epoch, m, ref1;
      ref1 = /^.+? (.*) (\d+) .*$/.exec(line);
      if(ref1 !== undefined && ref1 !== null && ref1.length > 0) {
        m = ref1[0], actor = ref1[1], epoch = ref1[2];
      } else {
        actor="REPLACE WITH YOUR GITHUB USER NAME, IE user";
        epoch="1518471247"; //(magic number)
      }
      return [Actor.from_string(actor), new Date(1000 * +epoch)];
    };
```

Initial publishing calls

1. Go back to the root of the ref-docs repo and call `gulp publish:ref-docs`
    - Once this call is finished executing, you should be able to see this ref-docs javadoc [link](http://azure.github.io/ref-docs/java/) updated
    - Sometimes because of your browser cache you won't see the update, if not, try opening it in incognito
2. `gulp publish:sdk`
    - Once this call is finished executing, you should be able to see this azure-sdk-for-java javadoc [link](http://azure.github.io/azure-sdk-for-java/) updated
    - Sometimes because of your browser cache you won't see the update, if not, try opening it in incognito

Go to azure/java/azure-sdk from the root of the ref-docs repo

1. `npm install`

Manual fix required here due to historical issue in the gh-pages branch. In node_modules/gift/lib/commit.js file change the method to the following.

``` javascript
Commit.actor = function(line) {
      var actor, epoch, m, ref1;
      ref1 = /^.+? (.*) (\d+) .*$/.exec(line);
      if(ref1 !== undefined && ref1 !== null && ref1.length > 0) {
        m = ref1[0], actor = ref1[1], epoch = ref1[2];
      } else {
        actor="REPLACE WITH YOUR GITHUB USER NAME, IE user";
        epoch="1518471247"; //(magic number)
      }
      return [Actor.from_string(actor), new Date(1000 * +epoch)];
    };
```

Final publishing call from azure/java/azure-sdk.

1. `gulp publish`
    - Once this call is finished executing, you should be able to see this azure-libraries-for-java javadoc [link](https://azure.github.io/azure-libraries-for-java/) updated.
    - Sometimes because of your browser cache you won't see the update, if not, try opening it in incognito
