# jar-client-x

## Java Applet Replacement - Client Side Application - Cross Platform

This repository contains code for electron-based client side application for  **jar-web** (Java Applet Replacement - Web Application)

This application is an example of how to perform actions outside the limitations of the browser.
For e.g. This application sends Performance metrics of your machine when connected to a proper **jar-web** server.

### Pre-requisites to run/debug

 - Node.js 8.2.1
 - Visual Studio Code (Recommended)

## How to run

 1. Clone this Github repository.
 2. Open the cloned repository in terminal and execute `npm install`. This will install all the dependencies required by this application
 3. Once dependencies are installed. Execute `npm start`. Application will be launched and can be seen running in tray.
 4. After the first launch, you can also try launching through protocol handler by copy-pasting `jarclient://ws://localhost/ctoken` to Browser's location bar or Window's Run Dialog


## How to debug 
1. Open the repository in Visual Studio Code.
2. Ensure you have executed `npm install` atleast once. If not you can run the same via VSCode's integrated terminal.
3. Press `F5` to start debugging. Enjoy!!!

## Screenshot
 - Connection Confirmation Dialog
 ![jar-client-x](https://user-images.githubusercontent.com/15712061/32700424-1159383e-c7eb-11e7-9644-e965b33472dc.png)
