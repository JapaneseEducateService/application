# Use the official Node.js image with specified version
FROM node:18-buster

# Set working directory
WORKDIR /app

# Install necessary dependencies for React Native
RUN apt-get update && apt-get install -y curl openjdk-11-jdk

# Install Yarn
RUN npm install -g yarn --force

# Install React Native CLI
RUN yarn global add react-native-cli

# Install Android Studio
RUN apt-get install -y unzip

# Download and install Android Studio
RUN curl -o android-studio.zip https://dl.google.com/dl/android/studio/ide-zips/4.2.1.0/android-studio-ide-202.7351085-linux.tar.gz && \
    tar -xzf android-studio.zip -C /opt/ && \
    rm android-studio.zip

# Set up environment variables for Android Studio
ENV ANDROID_HOME /opt/android-studio
ENV PATH ${PATH}:${ANDROID_HOME}/bin:${ANDROID_HOME}/platform-tools

# Expose the port for Metro bundler
EXPOSE 8081
