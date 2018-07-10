
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

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;

import com.mirasense.scanditsdk.LegacyPortraitScanditSDKBarcodePicker;
import com.mirasense.scanditsdk.ScanditSDKBarcodePicker;
import com.mirasense.scanditsdk.ScanditSDKScanSettings;
import com.mirasense.scanditsdk.internal.ScanditSDKGlobals;
import com.mirasense.scanditsdk.interfaces.ScanditSDK;
import com.mirasense.scanditsdk.interfaces.ScanditSDKListener;
import com.mirasense.scanditsdk.interfaces.ScanditSDKOverlay;

/**
 * Activity integrating the barcode scanner.
 *
 */
public class ScanditSDKActivity extends Activity implements ScanditSDKListener {
    
    public static final int CANCEL = 0;
    public static final int SCAN = 1;
    public static final int MANUAL = 2;

    private static ScanditSDKActivity sActiveActivity = null;

    private ScanditSDK mBarcodePicker;
    private boolean mContinuousMode = false;
    
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        initializeAndStartBarcodeRecognition(getIntent().getExtras());
        super.onCreate(savedInstanceState);
    }
    
    @SuppressWarnings("deprecation")
    public void initializeAndStartBarcodeRecognition(Bundle extras) {
        // Switch to full screen.
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                             WindowManager.LayoutParams.FLAG_FULLSCREEN);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        
        ScanditSDKGlobals.usedFramework = "phonegap";

        ScanditSDKScanSettings settings = ScanditSDKParameterParser.settingsForBundle(extras);

        if (ScanditSDKBarcodePicker.canRunPortraitPicker()) {
            ScanditSDKBarcodePicker picker = new ScanditSDKBarcodePicker(
                    this, extras.getString(ScanditSDKParameterParser.paramAppKey), settings);

            this.setContentView(picker);
            mBarcodePicker = picker;
        } else {
            // Make sure the orientation is correct as the old GUI will only
            // be displayed correctly if the activity is in landscape mode.
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);

            LegacyPortraitScanditSDKBarcodePicker picker = new LegacyPortraitScanditSDKBarcodePicker(
                    this, extras.getString(ScanditSDKParameterParser.paramAppKey), settings);

            this.setContentView(picker);
            mBarcodePicker = picker;
        }

        ScanditSDKParameterParser.updatePickerUIFromBundle(mBarcodePicker, extras);

        if (extras.containsKey(ScanditSDKParameterParser.paramContinuousMode)) {
            mContinuousMode = extras.getBoolean(ScanditSDKParameterParser.paramContinuousMode);
        }
        
        // Register listener, in order to be notified about relevant events
        // (e.g. a successfully scanned bar code).
        mBarcodePicker.getOverlayView().addListener(this);
    }
    
    @Override
    protected void onPause() {
        sActiveActivity = null;
        // When the activity is in the background immediately stop the
        // scanning to save resources and free the camera.
        mBarcodePicker.stopScanning();
        super.onPause();
    }
    
    @Override
    protected void onResume() {
        // Once the activity is in the foreground again, restart scanning.
        mBarcodePicker.startScanning();
        sActiveActivity = this;
        super.onResume();
    }

    public void pauseScanning() {
        mBarcodePicker.pauseScanning();
    }

    public void resumeScanning() {
        mBarcodePicker.resumeScanning();
    }

    public void stopScanning() {
        mBarcodePicker.stopScanning();
    }

    public void startScanning() {
        mBarcodePicker.startScanning();
    }
    
    /**
     * Called when the user canceled the bar code scanning.
     */
    public void didCancel() {
        finishView();
        
        setResult(CANCEL);
        finish();
    }
    
    /**
     * Called when a bar code has been scanned.
     *
     * @param barcode Scanned bar code content.
     * @param symbology Scanned bar code symbology .
     */
    public void didScanBarcode(String barcode, String symbology) {
        if (!mContinuousMode) {
            finishView();
            
            Intent intent = new Intent();
            intent.putExtra("barcode", barcode.trim());
            intent.putExtra("symbology", symbology);
            setResult(SCAN, intent);
            finish();
        } else {
            Bundle bundle = new Bundle();
            bundle.putString("barcode", barcode.trim());
            bundle.putString("symbology", symbology);
            ScanditSDKResultRelay.onResult(bundle);
        }
    }
    
    /** 
     * Called when the user entered a bar code manually.
     * 
     * @param entry The information entered by the user.
     */
    public void didManualSearch(String entry) {
        if (!mContinuousMode) {
            Intent intent = new Intent();
            intent.putExtra("barcode", entry.trim());
            intent.putExtra("symbology", "UNKNOWN");
            setResult(MANUAL, intent);
            finish();
        } else {
            Bundle bundle = new Bundle();
            bundle.putString("barcode", entry.trim());
            bundle.putString("symbology", "UNKNOWN");
            ScanditSDKResultRelay.onResult(bundle);
        }
    }
    
    /**
     * Called before this activity is finished to improve on the transitioning
     * time.
     */
    private void finishView() {
        mBarcodePicker.stopScanning();
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
    }
    
    @Override
    public void onBackPressed() {
        didCancel();
    }

    public static void cancel() {
        sActiveActivity.didCancel();
    }

    public static void pause() {
        sActiveActivity.pauseScanning();
    }

    public static void resume() {
        sActiveActivity.resumeScanning();
    }

    public static void stop() {
        sActiveActivity.stopScanning();
    }

    public static void start() {
        sActiveActivity.startScanning();
    }
}
