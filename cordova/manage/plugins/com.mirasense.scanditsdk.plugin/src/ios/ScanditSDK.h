
//
//  Copyright 2010 Mirasense AG
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//
//

#import "Cordova/CDVPlugin.h"

#define dispatch_main_sync_safe(block)\
if ([NSThread isMainThread]) {\
block();\
} else {\
dispatch_sync(dispatch_get_main_queue(), block);\
}


@interface ScanditSDK : CDVPlugin

/**
 * Starts the scanning. You call this the following way from java script (success and failure are
 * callback functions defined by you):
 *
 * cordova.exec(success, failure, "ScanditSDK", "scan", ["___your_app_key___",
 *              {"option1":"value1", "option2":true}]);
 *
 *
 * The available options are:
 *
 * exampleStringForOption: defaultValue
 * Short explanation of option.
 *
 * preferFrontCamera: false
 * Whether showing the front camera should be preferred over the back camera (for devices without a
 * front camera the back camera is shown).
 *
 * orientations: (default setting is the same as set in the app settings)
 * Sets which orientations are allowed for the scanner if they should differ from the orientations
 * that are allowed in the whole app. This only works if the scanner is shown in full screen mode
 * and does not work if margins are set. Legal values: portrait, portraitUpsideDown, landscapeLeft,
 * landscapeRight. Example: "landscapeRight,landscapeLeft"
 *
 * disableStandbyState: false
 * Disables the standby state of the camera between times when the scanner is actually running.
 * If your app accesses the camera in multiple ways it is recommended to set this to true.
 *
 * searchBar: true
 * Shows or hides the search bar at the top of the screen.
 *
 * 1DScanning: true
 * The parameter '1DScanning' is deprecated. Please enable symbologies individually instead.
 * Enables or disables the recognition of 1D codes.
 *
 * 2DScanning: true
 * The parameter '2DScanning' is deprecated. Please enable symbologies individually instead.
 * Enables or disables the recognition of 2D codes.
 *
 * ean13AndUpc12: true
 * Enables or disables the recognition of EAN13 and UPC12/UPCA codes.
 *
 * ean8: true
 * Enables or disables the recognition of EAN8 codes.
 *
 * upce: true
 * Enables or disables the recognition of UPCE codes.
 *
 * code39: true
 * Enables or disables the recognition of CODE39 codes.
 * Note: Not all Scandit SDK versions support Code 39 scanning.
 *
 * code93: false
 * Enables or disables the recognition of CODE93 codes.
 * Note: Not all Scandit SDK versions support Code 93 scanning.
 *
 * code128: true
 * Enables or disables the recognition of CODE128 codes.
 * Note: Not all Scandit SDK versions support Code 128 scanning.
 *
 * itf: true
 * Enables or disables the recognition of ITF codes.
 * Note: Not all Scandit SDK versions support ITF scanning.
 *
 * gs1DataBar: false
 * Enables or disables the recognition of GS1 DataBar codes.
 * Note: Not all Scandit SDK versions support GS1 DataBar scanning.
 *
 * gs1DataBarExpanded: false
 * Enables or disables the recognition of GS1 DataBar Expanded codes.
 * Note: Not all Scandit SDK versions support GS1 DataBar Expanded scanning.
 *
 * codabar: false
 * Enables or disables the recognition of CODABAR codes.
 * Note: Not all Scandit SDK versions support Codabar scanning.
 *
 * qr: true
 * Enables or disables the recognition of QR codes.
 *
 * dataMatrix: true
 * Enables or disables the recognition of Data Matrix codes.
 * Note: Not all Scandit SDK versions support Data Matrix scanning.
 *
 * pdf417: true
 * Enables or disables the recognition of PDF417 codes.
 * Note: Not all Scandit SDK versions support PDF417 scanning.
 *
 * aztec: false
 * Enables or disables the recognition of Aztec codes.
 * Note: Not all Scandit SDK versions support Aztec scanning.
 *
 * msiPlessey: false
 * Enables or disables the recognition of MSI Plessey codes.
 * Note: Not all Scandit SDK versions support MSI Plessey scanning.
 *
 * msiPlesseyChecksumType: "mod10"
 * Sets the type of checksum that is expected of the MSI Plessey codes.
 * Legal values are: "none", "mod10", "mod11", "mod1010", "mod1110"
 *
 * inverseRecognition: false
 * Enables the detection of white on black codes. This option currently
 * only works on Data Matrix codes.
 *
 * microDataMatrix: false
 * Enables special settings to allow the recognition of very small Data
 * Matrix codes. If this is not specifically needed, do not enable it as it
 * uses considerable processing power. This setting automatically forces
 * 2d recognition on every frame. This option only works on devices with
 * Android 2.2 or higher, it does not cause issues with lower versions but
 * simply doesn't work.
 *
 * force2d: false
 * Forces the engine to always run a 2d recognition, ignoring whether a 2d
 * code was detected in the current frame.
 *
 * codeDuplicateFilter: 0
 * The duration of the duplicate filter in milliseconds. When set to a value
 * larger than zero, barcodes with the same symbology and data are filtered
 * out if they are decoded less than the given milliseconds apart. Set this
 * value to zero if you do not want to filter duplicates. When set to -1
 * barcodes are filtered as duplicates if they match an already decoded
 * barcode in the session (A session ends with a call to cancel or stop or
 * a successful scan in non-continuous mode).
 *
 * scanningHotSpot: "0.5/0.5" (x/y)
 * Changes the location of the spot where the recognition actively scans for
 * barcodes. X and y can be between 0 and 1, where 0/0 is the top left corner
 * and 1/1 the bottom right corner.
 *
 * scanningHotSpotHeight: 0.25
 * Changes the height of the spot where the recognition actively scans for
 * barcodes. The height of the hot spot is given relative to the height of
 * the screen and has to be between 0.0 and 0.5.
 * Be aware that if the hot spot height is very large, the engine is forced
 * to decrease the quality of the recognition to keep the speed at an
 * acceptable level.
 *
 * viewfinderSize: "0.8/0.4/0.6/0.4" (width/height/landscapeWidth/landscapeHeight)
 * Sets the size of the viewfinder relative to the size of the screen size.
 * Changing this value does not(!) affect the area in which barcodes are successfully recognized.
 * It only changes the size of the box drawn onto the scan screen.
 *
 * beep: true
 * Enables or disables the sound played when a code was recognized.
 *
 * vibrate: true
 * Enables or disables the vibration when a code was recognized.
 *
 * torch: true
 * Enables or disables the torch toggle button for all devices that support a torch.
 *
 * torchButtonMarginsAndSize: "15/15/40/40" (leftMargin/topMargin/width/height)
 * Sets the position at which the button to enable the torch is drawn.
 *
 * cameraSwitchVisibility: "never"
 * Sets when the camera switch button is visible for all devices that have more than one camera.
 * Legal values are: "never", "tablet", "always"
 *
 * cameraSwitchButtonMarginsAndSize: "15/15/40/40" (rightMargin/topMargin/width/height)
 * Sets the position at which the button to switch the camera is drawn.
 *
 * logoOffsets: "0, 0, 0, 0" (xOffset, yOffset, landscapeXOffset, landscapeYOffset)
 * Sets the x and y offset at which the Scandit logo should be drawn for both portrait and landscape
 * orientation. Be aware that the standard Scandit SDK licenses do not allow you to hide the logo.
 *
 * searchBarActionButtonCaption: "Go"
 * Sets the caption of the manual entry at the top when a barcode of valid length has been entered.
 *
 * searchBarCancelButtonCaption: "Cancel"
 * Sets the caption of the manual entry at the top when no barcode of valid length has been entered.
 *
 * searchBarPlaceholderText: "Scan barcode or enter it here"
 * Sets the text shown in the manual entry field when nothing has been entered yet.
 *
 * toolBarButtonCaption: "Cancel"
 * Sets the caption of the toolbar button.
 *
 * viewfinderColor: "FFFFFF"
 * Sets the color of the static viewfinder and while tracking before the code has been recognized.
 *
 * viewfinderDecodedColor: "00FF00"
 * Sets the color of the viewfinder when the code has been recognized.
 *
 * minSearchBarBarcodeLength: 8
 * Sets the minimum size a barcode in the manual entry field has to have to possibly be valid.
 *
 * maxSearchBarBarcodeLength: 100
 * Sets the maximum size a barcode in the manual entry field can have to possibly be valid.
 *
 * continuousMode: false
 * Enables continous mode. If a barcode is scanned, the scanner is not dismissed and the user is
 * able to continue scanning until he presses `Cancel` or the plugins cancel function is called.
 *
 * portraitMargins: "0/0/0/0"
 * Sets left/top/right/bottom margins (in resolution independent pixels) for the scanner in
 * portrait orientation. Settings margins will start the scanner in a subview on top of Cordova's 
 * webview and not in its own view controller.
 * Use this parameter to make the scanner smaller than fullscreen and show your own content along
 * with the scanner.
 *
 * landscapeMargins: "0/0/0/0"
 * Sets left/top/right/bottom margins (in resolution independent pixels) for the scanner in
 * landscape orientation. Settings margins will start the scanner in a subview on top of Cordova's
 * webview and not in its own view controller.
 * Use this parameter to make the scanner smaller than fullscreen and show your own content along
 * with the scanner.
 */
- (void)scan:(CDVInvokedUrlCommand *)command;

/**
 * Cancels the scanning. You call this the following way from java script:
 *
 * cordova.exec(null, null, "ScanditSDK", "cancel", []);
 */
- (void)cancel:(CDVInvokedUrlCommand *)command;

/**
 * Pauses the scanning while the video feed continues to run You call this the following way from 
 * java script:
 *
 * cordova.exec(null, null, "ScanditSDK", "pause", []);
 */
- (void)pause:(CDVInvokedUrlCommand *)command;

/**
 * Resumes the scanning after pause was called. You call this the following way from java script:
 *
 * cordova.exec(null, null, "ScanditSDK", "resume", []);
 */
- (void)resume:(CDVInvokedUrlCommand *)command;

/**
 * Stops the scanning and also freezes the video feed. You call this the following way from java 
 * script:
 *
 * cordova.exec(null, null, "ScanditSDK", "stop", []);
 */
- (void)stop:(CDVInvokedUrlCommand *)command;

/**
 * Restarts the scanning after stop or pause were called. You call this the following way from java
 * script:
 *
 * cordova.exec(null, null, "ScanditSDK", "start", []);
 */
- (void)start:(CDVInvokedUrlCommand *)command;

/**
 * Resizes the scanner and newly configures the UI. This call does not have any effect if the
 * scanner is launched in full screen mode. To not launch in full screen mode you have to set the
 * portrait and/or landscape margins in the scan call.
 * You call this the following way from java script:
 *
 * cordova.exec(null, null, "ScanditSDK", "resize", [{"option1":"value1", "option2":true}]);
 *
 *
 * The available options are:
 *
 * exampleStringForOption: defaultValue
 * Short explanation of option.
 *
 * scanningHotSpot: "0.5/0.5" (x/y)
 * Changes the location of the spot where the recognition actively scans for
 * barcodes. X and y can be between 0 and 1, where 0/0 is the top left corner
 * and 1/1 the bottom right corner.
 *
 * scanningHotSpotHeight: 0.25
 * Changes the height of the spot where the recognition actively scans for
 * barcodes. The height of the hot spot is given relative to the height of
 * the screen and has to be between 0.0 and 0.5.
 * Be aware that if the hot spot height is very large, the engine is forced
 * to decrease the quality of the recognition to keep the speed at an
 * acceptable level.
 *
 * viewfinderSize: "0.8/0.4/0.6/0.4" (width/height/landscapeWidth/landscapeHeight)
 * Sets the size of the viewfinder relative to the size of the screen size.
 * Changing this value does not(!) affect the area in which barcodes are successfully recognized.
 * It only changes the size of the box drawn onto the scan screen.
 *
 * beep: true
 * Enables or disables the sound played when a code was recognized.
 *
 * vibrate: true
 * Enables or disables the vibration when a code was recognized.
 *
 * torch: true
 * Enables or disables the torch toggle button for all devices that support a torch.
 *
 * torchButtonPositionAndSize: "0.05/0.01/67/33" (x/y/width/height)
 * Sets the position at which the button to enable the torch is drawn. The X and Y coordinates are
 * relative to the screen size, which means they have to be between 0 and 1.
 *
 * cameraSwitchVisibility: "never"
 * Sets when the camera switch button is visible for all devices that have more than one camera.
 * Legal values are: "never", "tablet", "always"
 *
 * cameraSwitchButtonPositionAndSize: "0.05/0.01/67/33" (x/y/width/height)
 * Sets the position at which the button to switch the camera is drawn. The X and Y coordinates are
 * relative to the screen size, which means they have to be between 0 and 1. Be aware that the x
 * coordinate is calculated from the right side of the screen and not the left like with the torch
 * button.
 *
 * logoOffsets: "0, 0, 0, 0" (xOffset, yOffset, landscapeXOffset, landscapeYOffset)
 * Sets the x and y offset at which the Scandit logo should be drawn for both portrait and landscape
 * orientation. Be aware that the standard Scandit SDK licenses do not allow you to hide the logo.
 *
 * searchBarActionButtonCaption: "Go"
 * Sets the caption of the manual entry at the top when a barcode of valid length has been entered.
 *
 * searchBarCancelButtonCaption: "Cancel"
 * Sets the caption of the manual entry at the top when no barcode of valid length has been entered.
 *
 * searchBarPlaceholderText: "Scan barcode or enter it here"
 * Sets the text shown in the manual entry field when nothing has been entered yet.
 *
 * toolBarButtonCaption: "Cancel"
 * Sets the caption of the toolbar button.
 *
 * viewfinderColor: "FFFFFF"
 * Sets the color of the static viewfinder and while tracking before the code has been recognized.
 *
 * viewfinderDecodedColor: "00FF00"
 * Sets the color of the viewfinder when the code has been recognized.
 *
 * minSearchBarBarcodeLength: 8
 * Sets the minimum size a barcode in the manual entry field has to have to possibly be valid.
 *
 * maxSearchBarBarcodeLength: 100
 * Sets the maximum size a barcode in the manual entry field can have to possibly be valid.
 *
 * portraitMargins: "0/0/0/0" (left/top/right/bottom)
 * Sets margins (in iOS resolution independent points) for the scanner in portrait orientation. 
 * Settings margins will start the scanner in a subview on top of Cordova's webview and not in its 
 * own view controller. Use this parameter to make the scanner smaller than fullscreen and show your 
 * own content along with the scanner.
 *
 * landscapeMargins: "0/0/0/0" (left/top/right/bottom)
 * Sets margins (in iOS resolution independent points) for the scanner in landscape orientation. 
 * Settings margins will start the scanner in a subview on top of Cordova's webview and not in its 
 * own view controller. Use this parameter to make the scanner smaller than fullscreen and show your 
 * own content along with the scanner.
 *
 * animationDuration: 0.0
 * Sets the animation duration for the change in margins.
 */
- (void)resize:(CDVInvokedUrlCommand *)command;

/**
 * Switches the torch on or off. Pass true to turn it on, false to turn it off.
 * You call this the following way from java script:
 *
 * cordova.exec(null, null, "ScanditSDK", "torch", [true]);
 */
- (void)torch:(CDVInvokedUrlCommand *)command;

@end
