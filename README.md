## **Description**

ChatApp is a chat app for mobile devices built with React Native and developed using Expo.

The chat interface functionality is created with the Gifted Chat library. Chat conversations are stored locally with Google Firestore Database and Google Firebase authentication and are also accessible offline.

Users are able to share images (take a picture or choose from media library) once the user grants access to their local media library and camera. Location sharing is enabled by the user granting the app permission to read user location data.

See the hosted project [here](https://akr0051.github.io/Meet-App/). 

## **Key Features**

* A page where users can enter their name and choose a background color for the chat screen before joining the chat.
 
* A page displaying the conversation, as well as an input field and submit button.
 
* The chat must provide users with two additional communication features: sending images and location data.

* Data gets stored online and offline.

## **Get Started**

### Install Dependencies

Check if you are running the latest version of [Node](https://nodejs.org/en/).

Install [Expo](https://expo.io) and create [your-Expo-account] (https://expo.io/signup)

`$ npm install expo-cli --global`

Set up your React Native App in your projects folder

`$ expo init hello-world`

Go to your project's directory

`$ cd hello-world`

Launch the https server Metro Bundler in a new tab

`$ npm run start`

or

`$ expo start`

### Emulator Setup

If you would like to run the app on your machine through a simulator/emulator, you will either need:

* [Android Studio](https://docs.expo.io/workflow/android-studio-emulator/)
* [iOS Simulator](https://docs.expo.io/workflow/ios-simulator/)

### Mobile Device Setup

* Install the Expo app through your device's app store (iOS or Android)
* Login with expo account
* Take a screenshot of the QR Code on the Metro Builder

## **Technologies**

* React Native

* Expo

* Google Firestore

* Gifted Chat

* Android Studio
