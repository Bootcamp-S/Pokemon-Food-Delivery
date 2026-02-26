FROM jenkins/inbound-agent:latest

USER root

RUN apt-get update && \
    apt-get install -y libatomic1 zip

RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

USER jenkins