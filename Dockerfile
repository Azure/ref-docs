# Set the base image
FROM picoded/ubuntu-openjdk-8-jdk
# Dockerfile author / maintainer 
MAINTAINER hovsepm <hovsepm@microsoft.com> 

# Update and install everything. 
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		maven \
		git \
		nodejs \
		vim \
	&& apt-get update

# Install Repo and gulp
RUN mkdir ~/bin \
	&& curl https://storage.googleapis.com/git-repo-downloads/repo > ~/bin/repo \
	&& chmod a+x ~/bin/repo \
	&& npm install --global gulp-cli

# set repo and java options env variables
ENV PATH="~/bin:${PATH}"
ENV JAVA_TOOL_OPTIONS='-Dfile.encoding=UTF8'

# Set the default command
ENTRYPOINT ["/bin/bash"]