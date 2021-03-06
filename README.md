# Repository Structure
```
GestureTag-prototype
|-- TouchPad    (Mac Trackpad App -- client)
|-- Eyetracking (Tobii eyetracker -- client)
|-- resources   (img, css, and js)
|-- views       (web client's view)
|server.js      (server)
|tap/swipe.html (Mobile Trackpad --  client)
```

# Instructions
Basically, start the server first and then enable one of trackpad client platform (Mac App or Webpage)

## Web client

### start the node http server
```
npm install
npm run-script tap (config the server for tap tasks)
npm run-script swipe [tester] [device] (tester: motor (4-dir) /others (8-dir); device: mobile/desktop)
npm run-script dwell (config the server for dwell tasks)

npm run [method] [user_category] [device] [user_id]      (ex: npm run swipe motor desktop tw_3)
```

### open the browser
```
localhost:3000
localhost:3000/gmail
localhost:3000/youtube
```
for the mock-up pages, the `zoom` value of the browser may need to be modified.
ps. size of the mock-up pages are `16:10`.

### open the touch input client

Skip this part if testing for dwelling.

- If you are using macOS, then you can open the Mac App.
    1. Please follow the instruction in section ## TouchPad ## to install all dependencies before running it.
    2. Open and Run TouchPad in Xcode

- If you are using Windows, please find a mobile phone or tablet.
    1. Find the local IP address of your laptop
    2. Open the web browser on the mobile device.
    3. Type [ip adrress]:3000/swipe or [ip adrress]:3000/tap in the address bar.
(you should see the page with purple background and 'a user connected' on the console of the server)

[How to find your ip address on Windows](https://www.digitalcitizen.life/find-ip-address-windows)
#### How to find your ip address on Mac/Linux:
``ifconfig | grep "inet " | grep -v 127.0.0.1``

### hot key
`space`: start a trial.
`p`: show the finger path on screen (only available in swipe method).
`e`: use mousemove instead of eyemove.

## TouchPad (Xcode Project with CocoaPods)
Make sure you have Apple Developer Account (it is free) and have installed CocoaPods and Xcode.

### Install CocoaPods
If you don't have Homebrew:
`sudo gem install cocoapods`

If you have it, then try to use Homebrew to install:
``brew install cocoapods``

### Install Dependencies
```
cd TouchPad
pod install
```

### Open TouchPad Project
```
open `TrackPad.xcworkspace` with Xcode or double click the file in your Finder.
```
