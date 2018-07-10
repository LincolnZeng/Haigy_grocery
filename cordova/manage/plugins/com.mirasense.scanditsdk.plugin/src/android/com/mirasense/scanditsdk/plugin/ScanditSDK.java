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

package com.mirasense.scanditsdk.plugin;

import android.content.Context;
import android.content.Intent;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.view.*;
import android.view.animation.Animation;
import android.view.animation.Transformation;
import android.webkit.WebView;
import android.widget.RelativeLayout;
import com.mirasense.scanditsdk.ScanditSDKBarcodePicker;
import com.mirasense.scanditsdk.ScanditSDKScanSettings;
import com.mirasense.scanditsdk.interfaces.ScanditSDKListener;
import com.mirasense.scanditsdk.plugin.ScanditSDKResultRelay.ScanditSDKResultRelayCallback;
import com.scandit.base.system.SbSystemUtils;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;


public class ScanditSDK extends CordovaPlugin implements ScanditSDKResultRelayCallback, ScanditSDKListener {

    public static final String SCAN = "scan";
    public static final String CANCEL = "cancel";
    public static final String PAUSE = "pause";
    public static final String RESUME = "resume";
    public static final String START = "start";
    public static final String STOP = "stop";
    public static final String RESIZE = "resize";
    
    private CallbackContext mCallbackContext;
    private boolean mContinuousMode = false;
    private boolean mPendingOperation = false;

    private Rect mPortraitMargins = new Rect(0, 0, 0, 0);
    private Rect mLandscapeMargins = new Rect(0, 0, 0, 0);
    private final OrientationHandler mHandler = new OrientationHandler(Looper.getMainLooper());

    private ScanditSDKBarcodePicker mBarcodePicker;
    private RelativeLayout mLayout;

    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        mCallbackContext = callbackContext;
        PluginResult result = null;

        if (action.equals(SCAN)) {
            scan(args);
            result = new PluginResult(Status.NO_RESULT);
            result.setKeepCallback(true);
            return true;
        } else if (action.equals(CANCEL)) {
            cancel(args);
            return true;
        } else if (action.equals(PAUSE)) {
            pause(args);
            return true;
        } else if (action.equals(RESUME)) {
            resume(args);
            return true;
        } else if (action.equals(STOP)) {
            stop(args);
            return true;
        } else if (action.equals(START)) {
            start(args);
            return true;
        } else if (action.equals(RESIZE)) {
            resize(args);
            return true;
        } else {
            result = new PluginResult(Status.INVALID_ACTION);
            callbackContext.error("Invalid Action: " + action);
            return false;
        }
    }

    /**
     * Starts the scanning. You call this the following way from java script (success and failure are
     * callback functions defined by you):
     *
     * cordova.exec(success, failure, "ScanditSDK", "scan", ["___your_app_key___",
     *              {"option1":"value1", "option2":true}]);
     *
     *
     * exampleStringForOption: defaultValue
     * Short explanation of option.
     *
     * preferFrontCamera: false
     * Whether showing the front camera should be preferred over the back camera (for devices without a
     * front camera the back camera is shown).
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
     * qr: false
     * Enables or disables the recognition of QR codes.
     *
     * dataMatrix: false
     * Enables or disables the recognition of Data Matrix codes.
     * Note: Not all Scandit SDK versions support Data Matrix scanning.
     *
     * pdf417: false
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
     * The duration of the duplicate filter in milliseconds. When set to a value larger than zero, barcodes with the
     * same symbology and data are filtered out if they are decoded less than the given milliseconds apart. Set this
     * value to zero if you do not want to filter duplicates. When set to -1 barcodes are filtered as duplicates if they
     * match an already decoded barcode in the session (A session ends with a call to cancel or stop or a successful
     * scan in non-continuous mode).
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
     * searchBar: false
     * Adds (or removes) a search bar to the top of the scan screen.
     *
     * beep: true
     * Enables or disables the sound played when a code was recognized.
     *
     * vibrate: true
     * Enables or disables the vibration when a code was recognized.
     *
     * torch: true
     * Enables or disables the icon that let's the user activate the LED torch
     * mode. If the device does not support torch mode, the icon to activate is
     * will not be visible regardless of the value.
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
     * searchBarHint: "Scan barcode or enter it here"
     * Sets the text shown in the manual entry field when nothing has been
     * entered yet.
     *
     * viewfinderSize: "0.8/0.4/0.6/0.4" (width/height/landscapeWidth/landscapeHeight)
     * Sets the size of the viewfinder relative to the size of the screen size.
     * Changing this value does not(!) affect the area in which barcodes are successfully recognized.
     * It only changes the size of the box drawn onto the scan screen.
     *
     * viewfinderColor: "FFFFFF"
     * Sets the color of the viewfinder when no code has been recognized yet.
     *
     * viewfinderDecodedColor: "00FF00"
     * Sets the color of the viewfinder once the barcode has been recognized.
     *
     * zoom: 0.4
     * Sets the zoom to the given percentage of the max zoom possible.
     *
     * continuousMode: false
     * Enable continous mode. If a barcode is scanned, the activity is not dismissed and the user
     * is able to continue scanning until he presses the back button to close the activity.
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
    private void scan(JSONArray data) {
        if (mPendingOperation) {
            return;
        }
        mPendingOperation = true;
        mHandler.start();

        final Bundle bundle = new Bundle();
        try {
            bundle.putString(ScanditSDKParameterParser.paramAppKey, data.getString(0));
        } catch (JSONException e) {
            Log.e("ScanditSDK", "Function called through Java Script contained illegal objects.");
            e.printStackTrace();
            return;
        }

        if (data.length() > 1) {
            // We extract all options and add them to the intent extra bundle.
            try {
                setOptionsOnBundle(data.getJSONObject(1), bundle);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        if (bundle.containsKey(ScanditSDKParameterParser.paramContinuousMode)) {
            mContinuousMode = bundle.getBoolean(ScanditSDKParameterParser.paramContinuousMode);
        }

        if (bundle.containsKey(ScanditSDKParameterParser.paramPortraitMargins)
                || bundle.containsKey(ScanditSDKParameterParser.paramLandscapeMargins)) {
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    ScanditSDKScanSettings settings = ScanditSDKParameterParser.settingsForBundle(bundle);
                    mBarcodePicker = new ScanditSDKBarcodePicker(cordova.getActivity(),
                            bundle.getString(ScanditSDKParameterParser.paramAppKey), settings);
                    mBarcodePicker.getOverlayView().addListener(ScanditSDK.this);
                    mLayout = new RelativeLayout(cordova.getActivity());

                    ViewGroup viewGroup = getViewGroupToAddTo();
                    if (viewGroup != null) {
                        viewGroup.addView(mLayout);
                    }

                    ScanditSDKParameterParser.updatePickerUIFromBundle(mBarcodePicker, bundle);

                    RelativeLayout.LayoutParams rLayoutParams = new RelativeLayout.LayoutParams(
                            RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT);
                    mLayout.addView(mBarcodePicker, rLayoutParams);
                    adjustLayout(bundle, 0);

                    mBarcodePicker.startScanning();
                }
            });

        } else {
            ScanditSDKResultRelay.setCallback(this);
            Intent intent = new Intent(cordova.getActivity(), ScanditSDKActivity.class);
            intent.putExtras(bundle);
            cordova.startActivityForResult(this, intent, 1);
        }
    }

    /**
     * Cancels the scanning. You call this the following way from java script:
     *
     * cordova.exec(null, null, "ScanditSDK", "cancel", []);
     */
    private void cancel(JSONArray data) {
        if (mBarcodePicker != null) {
            didCancel();
        } else {
            ScanditSDKActivity.cancel();
        }
    }

    /**
     * Pauses the scanning while the video feed continues to run You call this the following way from
     * java script:
     *
     * cordova.exec(null, null, "ScanditSDK", "pause", []);
     */
    private void pause(JSONArray data) {
        if (mBarcodePicker != null) {
            mBarcodePicker.pauseScanning();
        } else {
            ScanditSDKActivity.pause();
        }
    }

    /**
     * Resumes the scanning after pause was called. You call this the following way from java script:
     *
     * cordova.exec(null, null, "ScanditSDK", "resume", []);
     */
    private void resume(JSONArray data) {
        if (mBarcodePicker != null) {
            mBarcodePicker.resumeScanning();
        } else {
            ScanditSDKActivity.resume();
        }
    }

    /**
     * Stops the scanning and also freezes the video feed. You call this the following way from java
     * script:
     *
     * cordova.exec(null, null, "ScanditSDK", "stop", []);
     */
    private void stop(JSONArray data) {
        if (mBarcodePicker != null) {
            mBarcodePicker.stopScanning();
        } else {
            ScanditSDKActivity.stop();
        }
    }

    /**
     * Restarts the scanning after stop or pause were called. You call this the following way from java
     * script:
     *
     * cordova.exec(null, null, "ScanditSDK", "start", []);
     */
    private void start(JSONArray data) {
        if (mBarcodePicker != null) {
            mBarcodePicker.startScanning();
        } else {
            ScanditSDKActivity.start();
        }
    }

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
     * searchBar: false
     * Adds (or removes) a search bar to the top of the scan screen.
     *
     * titleBar: true
     * Adds (or removes) the title bar at the top of the scan screen.
     * This parameter is deprecated but retained for use with the old GUI which is
     * superseeded by the new 3.0 GUI that does not have a title bar anymore.
     *
     * toolBar: true
     * Adds (or removes) the tool bar at the bottom of the scan screen.
     * This parameter is deprecated but retained for use with the old GUI which is
     * superseeded by the new 3.0 GUI that does not have a tool bar anymore.
     *
     * beep: true
     * Enables or disables the sound played when a code was recognized.
     *
     * vibrate: true
     * Enables or disables the vibration when a code was recognized.
     *
     * torch: true
     * Enables or disables the icon that let's the user activate the LED torch
     * mode. If the device does not support torch mode, the icon to activate is
     * will not be visible regardless of the value.
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
     * titleMessage: "Scan a barcode"
     * Sets the title shown at the top of the screen.
     *
     * leftButtonCaption: "KEYPAD"
     * Sets the caption of the left button.
     * Deprecated: This string is only used in the old GUI.
     *
     * leftButtonCaptionWhenKeypadVisible: "OK"
     * Sets the caption of the left button when the keypad is visible.
     *
     * rightButtonCaption: "CANCEL"
     * Sets the caption of the right button.
     *
     * rightButtonCaptionWhenKeypadVisible: "CANCEL"
     * Sets the caption of the right button when the keypad is visible.
     *
     * searchBarHint: "Scan barcode or enter it here"
     * Sets the text shown in the manual entry field when nothing has been
     * entered yet.
     *
     * viewfinderSize: "0.8/0.4/0.6/0.4" (width/height/landscapeWidth/landscapeHeight)
     * Sets the size of the viewfinder relative to the size of the screen size.
     * Changing this value does not(!) affect the area in which barcodes are successfully recognized.
     * It only changes the size of the box drawn onto the scan screen.
     *
     * viewfinderColor: "FFFFFF"
     * Sets the color of the viewfinder when no code has been recognized yet.
     *
     * viewfinderDecodedColor: "00FF00"
     * Sets the color of the viewfinder once the barcode has been recognized.
     *
     * zoom: 0.4
     * Sets the zoom to the given percentage of the max zoom possible.
     *
     * continuousMode: false
     * Enable continous mode. If a barcode is scanned, the activity is not dismissed and the user
     * is able to continue scanning until he presses the back button to close the activity.
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
     *
     * animationDuration: 0.0
     * Sets the animation duration for the change in margins.
     */
    private void resize(JSONArray data) {
        if (mBarcodePicker != null) {
            final Bundle bundle = new Bundle();
            try {
                if (data.length() < 1) {
                    Log.e("ScanditSDK", "The resize call received too few arguments and has to return without starting.");
                    return;
                }
                setOptionsOnBundle(data.getJSONObject(0), bundle);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    ScanditSDKParameterParser.updatePickerUIFromBundle(mBarcodePicker, bundle);
                    double animationDuration = 0;
                    if (bundle.containsKey(ScanditSDKParameterParser.paramAnimationDuration)) {
                        animationDuration = bundle.getDouble(ScanditSDKParameterParser.paramAnimationDuration);
                    }
                    adjustLayout(bundle, animationDuration);
                }
            });
        }
    }

    /**
     * Adjusts the layout parameters of the barcode picker according to the margins set through java script.
     *
     * @param bundle The bundle with the java script parameters.
     * @param animationDuration Over how long the change should be animated.
     */
    private void adjustLayout(Bundle bundle, double animationDuration) {
        final RelativeLayout.LayoutParams rLayoutParams = (RelativeLayout.LayoutParams) mBarcodePicker.getLayoutParams();

        Display display = ((WindowManager) webView.getContext().getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay();
        if (bundle.containsKey(ScanditSDKParameterParser.paramPortraitMargins) && display.getHeight() > display.getWidth()) {
            String portraitMargins = bundle.getString(ScanditSDKParameterParser.paramPortraitMargins);
            String[] split = portraitMargins.split("[/]");
            if (split.length == 4) {
                try {
                    final Rect oldPortraitMargins = new Rect(mPortraitMargins);
                    mPortraitMargins = new Rect(Integer.valueOf(split[0]), Integer.valueOf(split[1]),
                            Integer.valueOf(split[2]), Integer.valueOf(split[3]));
                    if (animationDuration > 0) {
                        Animation anim = new Animation() {
                            @Override
                            protected void applyTransformation(float interpolatedTime, Transformation t) {
                                rLayoutParams.topMargin = SbSystemUtils.pxFromDp(webView.getContext(),
                                        (int) (oldPortraitMargins.top
                                                + (mPortraitMargins.top - oldPortraitMargins.top) * interpolatedTime));
                                rLayoutParams.rightMargin = SbSystemUtils.pxFromDp(webView.getContext(),
                                        (int) (oldPortraitMargins.right
                                                + (mPortraitMargins.right - oldPortraitMargins.right) * interpolatedTime));
                                rLayoutParams.bottomMargin = SbSystemUtils.pxFromDp(webView.getContext(),
                                        (int) (oldPortraitMargins.bottom
                                                + (mPortraitMargins.bottom - oldPortraitMargins.bottom) * interpolatedTime));
                                rLayoutParams.leftMargin = SbSystemUtils.pxFromDp(webView.getContext(),
                                        (int) (oldPortraitMargins.left
                                                + (mPortraitMargins.left - oldPortraitMargins.left) * interpolatedTime));
                                mBarcodePicker.setLayoutParams(rLayoutParams);
                            }
                        };
                        anim.setDuration((int) (animationDuration * 1000));
                        mBarcodePicker.startAnimation(anim);
                    } else {

                        rLayoutParams.topMargin = SbSystemUtils.pxFromDp(webView.getContext(), mPortraitMargins.top);
                        rLayoutParams.rightMargin = SbSystemUtils.pxFromDp(webView.getContext(), mPortraitMargins.right);
                        rLayoutParams.bottomMargin = SbSystemUtils.pxFromDp(webView.getContext(), mPortraitMargins.bottom);
                        rLayoutParams.leftMargin = SbSystemUtils.pxFromDp(webView.getContext(), mPortraitMargins.left);
                        mBarcodePicker.setLayoutParams(rLayoutParams);
                    }
                } catch (NumberFormatException e) {

                }
            }
        } else if (bundle.containsKey(ScanditSDKParameterParser.paramLandscapeMargins) && display.getWidth() > display.getHeight()) {
            String landscapeMargins = bundle.getString(ScanditSDKParameterParser.paramLandscapeMargins);
            String[] split = landscapeMargins.split("[/]");
            if (split.length == 4) {
                final Rect oldLandscapeMargins = new Rect(mLandscapeMargins);
                mLandscapeMargins = new Rect(Integer.valueOf(split[0]), Integer.valueOf(split[1]),
                        Integer.valueOf(split[2]), Integer.valueOf(split[3]));

                Animation anim = new Animation() {
                    @Override
                    protected void applyTransformation(float interpolatedTime, Transformation t) {
                        rLayoutParams.topMargin = SbSystemUtils.pxFromDp(webView.getContext(),
                                (int) (oldLandscapeMargins.top
                                        + (mLandscapeMargins.top - oldLandscapeMargins.top) * interpolatedTime));
                        rLayoutParams.rightMargin = SbSystemUtils.pxFromDp(webView.getContext(),
                                (int)(oldLandscapeMargins.right
                                        + (mLandscapeMargins.right - oldLandscapeMargins.right) * interpolatedTime));
                        rLayoutParams.bottomMargin = SbSystemUtils.pxFromDp(webView.getContext(),
                                (int)(oldLandscapeMargins.bottom
                                        + (mLandscapeMargins.bottom - oldLandscapeMargins.bottom) * interpolatedTime));
                        rLayoutParams.leftMargin = SbSystemUtils.pxFromDp(webView.getContext(),
                                (int)(oldLandscapeMargins.left
                                        + (mLandscapeMargins.left - oldLandscapeMargins.left) * interpolatedTime));
                        mBarcodePicker.setLayoutParams(rLayoutParams);
                    }
                };
                anim.setDuration((int) (animationDuration * 1000));
                mBarcodePicker.startAnimation(anim);
            }
        }
    }
    
    /**
     * Switches the torch on or off. Pass true to turn it on, false to turn it off.
     * You call this the following way from java script:
     *
     * cordova.exec(null, null, "ScanditSDK", "torch", [true]);
     */
    private void torch(JSONArray data) {
        boolean enabled = false;
        try {
            if (data.length() < 1) {
                Log.e("ScanditSDK", "The torch call received too few arguments and has to return without starting.");
                return;
            }
            enabled = data.getBoolean(0);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        final boolean innerEnabled = enabled;
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                if (mBarcodePicker != null) {
                    mBarcodePicker.switchTorchOn(innerEnabled);
                }
            }
        });
    }
    
    private void removeSubviewPicker() {
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                mBarcodePicker.stopScanning();

                ViewGroup viewGroup = getViewGroupToAddTo();
                if (viewGroup != null) {
                    viewGroup.removeView(mLayout);
                }
                mLayout = null;
                mBarcodePicker = null;
            }
        });
    }

    private void setOptionsOnBundle(JSONObject options, Bundle bundle) {
        @SuppressWarnings("unchecked")
        Iterator<String> iter = (Iterator<String>) options.keys();
        while (iter.hasNext()) {
            String key = iter.next();
            Object obj = options.opt(key);
            if (obj != null) {
                if (obj instanceof Float) {
                    bundle.putFloat(key.toLowerCase(), (Float) obj);
                } else if (obj instanceof Double) {
                    bundle.putDouble(key.toLowerCase(), (Double) obj);
                } else if (obj instanceof Integer) {
                    bundle.putInt(key.toLowerCase(), (Integer) obj);
                } else if (obj instanceof Boolean) {
                    bundle.putBoolean(key.toLowerCase(), (Boolean) obj);
                } else if (obj instanceof String) {
                    bundle.putString(key.toLowerCase(), (String) obj);
                }
            }
        }
    }
    
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        ScanditSDKResultRelay.setCallback(null);
        if (resultCode == ScanditSDKActivity.SCAN || resultCode == ScanditSDKActivity.MANUAL) {
            String barcode = data.getExtras().getString("barcode");
            String symbology = data.getExtras().getString("symbology");
            JSONArray args = new JSONArray();
            args.put(barcode);
            args.put(symbology);
            mPendingOperation = false;
            mHandler.stop();
            mCallbackContext.success(args);
            
        } else if (resultCode == ScanditSDKActivity.CANCEL) {
            mPendingOperation = false;
            mHandler.stop();
            mCallbackContext.error("Canceled");
        }
    }
    
    @Override
    public void onResultByRelay(Bundle bundle) {
        String barcode = bundle.getString("barcode");
        String symbology = bundle.getString("symbology");
        JSONArray args = new JSONArray();
        args.put(barcode);
        args.put(symbology);
        PluginResult result = new PluginResult(Status.OK, args);
        if (mContinuousMode) {
            result.setKeepCallback(true);
        } else {
            mPendingOperation = false;
            mHandler.stop();
        }
        mCallbackContext.sendPluginResult(result);
    }

    @Override
    public void didCancel() {
        removeSubviewPicker();
        mPendingOperation = false;
        mHandler.stop();
        mCallbackContext.error("Canceled");
    }

    @Override
    public void didScanBarcode(String barcode, String symbology) {
        JSONArray args = new JSONArray();
        args.put(barcode);
        args.put(symbology);
        PluginResult result = new PluginResult(Status.OK, args);
        if (mContinuousMode) {
            result.setKeepCallback(true);
        } else {
            removeSubviewPicker();
            mPendingOperation = false;
            mHandler.stop();
        }
        mCallbackContext.sendPluginResult(result);
    }

    @Override
    public void didManualSearch(String s) {
        JSONArray args = new JSONArray();
        args.put(s);
        args.put("UNKNOWN");
        PluginResult result = new PluginResult(Status.OK, args);
        if (mContinuousMode) {
            result.setKeepCallback(true);
        } else {
            removeSubviewPicker();
            mPendingOperation = false;
            mHandler.stop();
        }
        mCallbackContext.sendPluginResult(result);
    }

    private ViewGroup getViewGroupToAddTo() {
        if (webView instanceof WebView) {
            return (ViewGroup) webView;
        } else {
            try {
                java.lang.reflect.Method getViewMethod = webView.getClass().getMethod("getView");
                Object viewObject = getViewMethod.invoke(webView);
                if (viewObject instanceof View) {
                    View view = (View)viewObject;
                    ViewParent parentView = view.getParent();
                    if (parentView instanceof ViewGroup) {
                        return (ViewGroup) parentView;
                    }
                }
            } catch (Exception e) {
                Log.e("ScanditSDK", "Unable to fetch the ViewGroup through webView.getView().getParent().");
                e.printStackTrace();
            }
        }
        return null;
    }

    /**
     * Handler to check the orientation of the phone and adjust the margins based on it.
     */
    private final class OrientationHandler extends Handler {

        final static int CHECK_ORIENTATION = 1;
        private int mLastRotation = 0;
        private boolean mRunning = false;

        public OrientationHandler(Looper mainLooper) {
            super(mainLooper);
        }

        @Override
        public void handleMessage(Message msg) {
            super.handleMessage(msg);

            switch (msg.what) {
                case CHECK_ORIENTATION:
                    if (mRunning) {
                        checkOrientation();
                    }
                    break;
            }
        }

        private void start() {
            if (!mRunning) {
                mRunning = true;
                mLastRotation = SbSystemUtils.getDisplayRotation(cordova.getActivity());
                mHandler.sendEmptyMessageDelayed(OrientationHandler.CHECK_ORIENTATION, 20);
            }
        }

        private void stop() {
            if (mRunning) {
                mRunning = false;
            }
        }

        private void checkOrientation() {
            Context context = cordova.getActivity();
            if (context != null) {
                int displayRotation = SbSystemUtils.getDisplayRotation(context);
                if (displayRotation != mLastRotation) {
                    Bundle bundle = new Bundle();
                    bundle.putString(ScanditSDKParameterParser.paramPortraitMargins, mPortraitMargins.left + "/" + mPortraitMargins.top
                            + "/" + mPortraitMargins.right + "/" + mPortraitMargins.bottom);
                    bundle.putString(ScanditSDKParameterParser.paramLandscapeMargins, mLandscapeMargins.left + "/" + mLandscapeMargins.top
                            + "/" + mLandscapeMargins.right + "/" + mLandscapeMargins.bottom);
                    adjustLayout(bundle, 0);
                    mLastRotation = displayRotation;
                }
                mHandler.sendEmptyMessageDelayed(OrientationHandler.CHECK_ORIENTATION, 20);
            }
        }
    }
}