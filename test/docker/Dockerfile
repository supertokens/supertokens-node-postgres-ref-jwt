FROM ubuntu:16.04

RUN apt-get update && apt-get upgrade -y

RUN apt-get install build-essential -y

RUN apt-get install curl -y

RUN curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh

RUN chmod +x nodesource_setup.sh 

RUN ./nodesource_setup.sh

RUN apt-get install -y nodejs

RUN apt-get install -y git-core

RUN apt-get install wget ca-certificates -y

RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'

RUN apt install postgresql postgresql-contrib -y

EXPOSE 5432

RUN echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/9.5/main/pg_hba.conf

USER postgres

RUN echo "listen_addresses = '0.0.0.0'" >> /etc/postgresql/9.5/main/postgresql.conf
