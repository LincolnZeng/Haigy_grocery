BarcodeScannerPlugin
====================

Cross platform Phonegap/Cordova Plugin of the Scandit Barcode Scanner SDK for iOS and Android

Follow the detailed instructions below to add a high-performance barcode scanner to your app in 5 min.

If you don't have a Phonegap app yet, we will show you how to generate a sample app below.  


Scandit Barcode Scanner SDK Plugin Integration via the Cordova Command Line Interface (CLI)
------------------------

**Important:** This repository does not contain the core library of the Scandit Barcode Scanner since the library can not be publicly distributed. It only contains the classes that wrap the library to create a PhoneGap plugin and is therefore not an installable PhoneGap plugin. The actual library is only available from your [Scandit account](https://ssl.scandit.com/account) where you can download the fully installable PhoneGap plugin that includes the libraries. 

The easiest way to install the Scandit Barcode Scanner plugin into your Phonegap/Cordova project is to use the [Cordova CLI](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface).

* Install [Cordova CLI](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface) if it is not already installed.
* [Sign up](http://www.scandit.com/pricing) and download the [Scandit Barcode Scanner SDK](http://www.scandit.com/barcode-scanner-sdk/) Cordova Plugins for iOS and Android from your Scandit account (do not download it from this git repository as it is missing the libraries!). Unzip the zip to a folder of your choice.

* Generate a sample Cordova project or use your existing Cordova project

To generate a sample project, use the following command line commands:
```
	cordova create helloworld
	cd helloworld
	cordova platform add ios
	cordova platform add android
```

* Install the [Scandit Barcode Scanner](http://www.scandit.com/barcode-scanner-sdk/) Plugin using [Cordova CLI](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface)

```
        cordova plugin add  <path to downloaded,unzipped ScanditSDK Plugin for Phonegap/Cordova>
```

* Start using the Scandit Barcode Scanner SDK in your html code
    * Get the app key from your Scandit account
    * Invoke the Scandit Barcode Scanner by invoking the cordova.exec() function with the following parameters:

	`cordova.exec(function(success), function(cancel), "ScanditSDK", "scan", ["ENTER YOUR APP KEY HERE",{}]);`

    * See [Scandit Barcode Scanner SDK Documentation](http://docs.scandit.com) for the full API reference.

* Build your project and 

```
cordova build
```

* Open the iOS project in XCode to deploy the app from there or directly install the Android app through adb. Depending on whether it is built with ant or gradle the path to the apk will slightly differ.

```
// gradle path
adb install platforms/android/build/outputs/apk/android-debug.apk

// ant path
adb install platforms/android/ant-build/CordovaApp-debug.apk
```


### Sample HTML + JS

#### Fullscreen Scanner

```html
<!DOCTYPE html>
<html>
    <!--
     #
     # Licensed to the Apache Software Foundation (ASF) under one
     # or more contributor license agreements.  See the NOTICE file
     # distributed with this work for additional information
     # regarding copyright ownership.  The ASF licenses this file
     # to you under the Apache License, Version 2.0 (the
     # "License"); you may not use this file except in compliance
     # with the License.  You may obtain a copy of the License at
     #
     # http://www.apache.org/licenses/LICENSE-2.0
     #
     # Unless required by applicable law or agreed to in writing,
     # software distributed under the License is distributed on an
     # "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     #  KIND, either express or implied.  See the License for the
     # specific language governing permissions and limitations
     # under the License.
     #
     -->
    <head>
        <meta charset="utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <!-- WARNING: for iOS 7, remove the width=device-width and height=device-height attributes. See https://issues.apache.org/jira/browse/CB-4323 -->
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
        <link rel="stylesheet" type="text/css" href="css/index.css" />
        <title>Scandit Barcode Scanner</title>
    </head>
    <body onload="onBodyLoad()" style="background: url(img/ScanditSDKDemo-Splash.png) no-repeat;background-size: 100%;background-color: #000000">
        <script type="text/javascript" src="cordova.js"></script>
        <script type="text/javascript" src="js/index.js"></script>
        <script type="text/javascript">
            function onBodyLoad() {
                document.addEventListener("deviceready", onDeviceReady, false);
            }

            function success(resultArray) {
                alert("Scanned " + resultArray[0] + " code: " + resultArray[1]);

            	// NOTE: Scandit SDK Phonegap Plugin Versions 1.* for iOS report
            	// the scanning result as a concatenated string.
            	// Starting with version 2.0.0, the Scandit SDK Phonegap
            	// Plugin for iOS reports the result as an array
            	// identical to the way the Scandit SDK plugin for Android reports results.

            	// If you are running the Scandit SDK Phonegap Plugin Version 1.* for iOS,
            	// use the following approach to generate a result array from the string result returned:
            	// resultArray = result.split("|");
            }

            function failure(error) {
                alert("Failed: " + error);
            }

            function scan() {
                // See below for all available options.
                cordova.exec(success, failure, "ScanditSDK", "scan",
                             ["ENTER YOUR APP KEY HERE",
                              {"beep": true,
                              "code128" : false,
                              "dataMatrix" : false}]);
            }

            app.initialize();
        </script>

        <div align="center" valign="center">
            <input type="button" value="scan" onclick="scan()" style="margin-top: 230px; width: 100px; height: 30px; font-size: 1em"/>
        </div>
    </body>
</html>

```


#### Subview Scanner (Scaled and Cropped) 

```html
<!DOCTYPE html>
    <!--
    #
    # Licensed to the Apache Software Foundation (ASF) under one
    # or more contributor license agreements.  See the NOTICE file
    # distributed with this work for additional information
    # regarding copyright ownership.  The ASF licenses this file
    # to you under the Apache License, Version 2.0 (the
    # "License"); you may not use this file except in compliance
    # with the License.  You may obtain a copy of the License at
    #
    # http://www.apache.org/licenses/LICENSE-2.0
    #
    # Unless required by applicable law or agreed to in writing,
    # software distributed under the License is distributed on an
    # "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    #  KIND, either express or implied.  See the License for the
    # specific language governing permissions and limitations
    # under the License.
    #
    -->
    <head>
        <meta charset="utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <!-- WARNING: for iOS 7, remove the width=device-width and height=device-height attributes. See https://issues.apache.org/jira/browse/CB-4323 -->
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
        <link rel="stylesheet" type="text/css" href="css/index.css" />
        <title>Scandit Barcode Scanner</title>
    </head>
    <body>
        <script type="text/javascript" src="cordova.js"></script>
        <script type="text/javascript" src="js/index.js"></script>
        <script type="text/javascript">

            function success(resultArray) {
                alert("Scanned " + resultArray[0] + " code: " + resultArray[1]);

                // NOTE: Scandit SDK Phonegap Plugin Versions 1.* for iOS report
                // the scanning result as a concatenated string.
                // Starting with version 2.0.0, the Scandit SDK Phonegap
                // Plugin for iOS reports the result as an array
                // identical to the way the Scandit SDK plugin for Android reports results.

                // If you are running the Scandit SDK Phonegap Plugin Version 1.* for iOS,
                // use the following approach to generate a result array from the string result returned:
                // resultArray = result.split("|");
            }

            function failure(error) {
                alert("Failed: " + error);
            }

            function scan() {
                // See below for all available options.
                cordova.exec(success, failure, "ScanditSDK", "scan",
                             ["ENTER YOUR APP KEY HERE",
                              {"beep": true,
                               "code128" : false,
                               "dataMatrix" : false,
                               "codeDuplicateFilter" : 1000,
                               "continuousMode" : true,
                               "portraitMargins" : "0/0/0/200"}]);
            }

            function stop() {
                cordova.exec(null, null, "ScanditSDK", "stop", []);
                cordova.exec(null, null, "ScanditSDK", "resize",
                             [{"portraitMargins" : "0/0/0/400", "animationDuration" : 0.5,
                               "viewfinderSize" : "0.8/0.2/0.6/0.4"}]);
            }

            function start() {
                cordova.exec(null, null, "ScanditSDK", "start", []);
                cordova.exec(null, null, "ScanditSDK", "resize",
                             [{"portraitMargins" : "0/0/0/200", "animationDuration" : 0.5,
                               "viewfinderSize" : "0.8/0.4/0.6/0.4"}]);
            }

            function cancel() {
                cordova.exec(null, null, "ScanditSDK", "cancel", []);
            }

            app.initialize();
        </script>

        <div>
            <input type="button" value="scan" onclick="scan()" style="position: absolute; bottom: 80px; left: 15%; width: 30%; height: 30px; font-size: 1em"/>
            <input type="button" value="cancel" onclick="cancel()" style="position: absolute; bottom: 80px; right: 15%; width: 30%; height: 30px; font-size: 1em"/>
            <input type="button" value="stop" onclick="stop()" style="position: absolute; bottom: 30px; left: 15%; width: 30%; height: 30px; font-size: 1em"/>
            <input type="button" value="restart" onclick="start()" style="position: absolute; bottom: 30px; right: 15%; width: 30%; height: 30px; font-size: 1em"/>
        </div>

    </body>
</html>
```



API for Scandit SDK Phonegap Plugin iOS and Android  
------------------------

See http://docs.scandit.com/interface_cordova_plugin.html for the plugin documentation.



License
-------
* This plug-in is released under the Apache 2.0 license: http://www.apache.org/licenses/LICENSE-2.0



Questions? Contact `support@scandit.com`.
