FROM resin/rpi-raspbian:wheezy
MAINTAINER Seungryong Kim <srkim@nm.gist.ac.kr>

#Update & Install wget, vim
RUN apt-get update
RUN apt-get -y install wget
RUN apt-get -y install vim

#Timezone
RUN cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime

#Install Oracle JAVA
RUN mkdir -p /opt
RUN wget --no-cookies --no-check-certificate --header "Cookie: gpw_e24=http%3A%2F%2Fwww.oracle.com%2F; oraclelicense=accept-securebackup-cookie" "http://download.oracle.com/otn-pub/java/jdk/8u33-b05/jdk-8u33-linux-arm-vfp-hflt.tar.gz" -O - | tar -zxv -C /opt

#Configurate environmental variables
ENV JAVA_HOME /opt/jdk1.8.0_33
ENV PATH $PATH:/opt/jdk1.8.0_33/bin
RUN ln -s /opt/jdk1.8.0_33/bin/java /usr/bin/java

#Install Flume
RUN sudo wget --no-check-certificate http://www.apache.org/dist/flume/1.6.0/apache-flume-1.6.0-bin.tar.gz -O - | tar -zxv
RUN sudo mv apache-flume-1.6.0-bin /flume

ADD plugins.d /flume/plugins.d
ADD flume-conf.properties /flume/conf/

#Working directory
WORKDIR /flume
