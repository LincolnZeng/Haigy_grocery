
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
import android.util.Log;
import android.view.Display;
import android.view.Window;
import android.view.WindowManager;

import com.scandit.barcodepicker.OnScanListener;
import com.scandit.barcodepicker.ScanSession;
import com.scandit.barcodepicker.ScanSettings;

import org.json.JSONArray;


/**
 * Activity integrating the barcode scanner.
 *
 */
public class ScanditSDKActivity extends Activity implements OnScanListener, SearchBarBarcodePicker.ScanditSDKSearchBarListener {
    
    public static final int CANCEL = 0;
    public static final int SCAN = 1;
    public static final int MANUAL = 2;

    private static ScanditSDKActivity sActiveActivity = null;

    private SearchBarBarcodePicker mBarcodePicker;
    private boolean mContinuousMode = false;

    private boolean mStartPaused = false;
    
    
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

        ScanSettings settings = ScanditSDKParameterParser.settingsForBundle(extras);

        mBarcodePicker = new SearchBarBarcodePicker(this, settings);

        this.setContentView(mBarcodePicker);

        Display display = getWindowManager().getDefaultDisplay();
        ScanditSDKParameterParser.updatePickerUIFromBundle(mBarcodePicker, extras,
                display.getWidth(), display.getHeight());

        if (extras.containsKey(ScanditSDKParameterParser.paramContinuousMode)) {
            mContinuousMode = extras.getBoolean(ScanditSDKParameterParser.paramContinuousMode);
        }
        
        // Register listener, in order to be notified about relevant events
        // (e.g. a successfully scanned bar code).
        mBarcodePicker.setOnScanListener(this);
        mBarcodePicker.setOnSearchBarListener(this);

        if (extras.containsKey(ScanditSDKParameterParser.paramPaused)
                && extras.getBoolean(ScanditSDKParameterParser.paramPaused)) {
            mStartPaused = true;
        } else {
            mStartPaused = false;
        }
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
        mBarcodePicker.startScanning(mStartPaused);
        sActiveActivity = this;
        super.onResume();
    }

    public void pauseScanning() {
        mBarcodePicker.pauseScanning();
    }

    public void resumeScanning() {
        mBarcodePicker.resumeScanning();
        mStartPaused = false;
    }

    public void stopScanning() {
        mBarcodePicker.stopScanning();
    }

    public void startScanning() {
        mBarcodePicker.startScanning();
        mStartPaused = false;
    }
    
    public void switchTorchOn(boolean enabled) {
        mBarcodePicker.switchTorchOn(enabled);
    }

    public void didCancel() {
        mBarcodePicker.stopScanning();

        setResult(CANCEL);
        finish();
    }

    @Override
    public void didScan(ScanSession session) {
        Log.e("ScanditSDK", "didScan 1");
        if (session.getNewlyRecognizedCodes().size() > 0) {
            Log.e("ScanditSDK", "didScan 2");
            if (!mContinuousMode) {
                Log.e("ScanditSDK", "didScan 2.5");
                session.stopScanning();

                Log.e("ScanditSDK", "didScan 3");
                Intent intent = new Intent();
                intent.putExtra("barcode", session.getNewlyRecognizedCodes().get(0).getData());
                intent.putExtra("symbology",
                        session.getNewlyRecognizedCodes().get(0).getSymbologyName());
                Log.e("ScanditSDK", "didScan 4");
                setResult(SCAN, intent);
                Log.e("ScanditSDK", "didScan 5");
                finish();
                Log.e("ScanditSDK", "called finish");
            } else {
                Log.e("ScanditSDK", "didScan 6");
                Bundle bundle = new Bundle();
                bundle.putString("barcode", session.getNewlyRecognizedCodes().get(0).getData());
                bundle.putString("symbology",
                        session.getNewlyRecognizedCodes().get(0).getSymbologyName());
                ScanditSDKResultRelay.onResult(bundle);
                Log.e("ScanditSDK", "not finish");
            }
        }
    }

    @Override
    public void didEnter(String entry) {
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
    
    @Override
    public void onBackPressed() {
        didCancel();
    }

    public static void cancel() {
        if (sActiveActivity != null) {
            sActiveActivity.didCancel();
        }
    }

    public static void pause() {
        if (sActiveActivity != null) {
            sActiveActivity.pauseScanning();
        }
    }

    public static void resume() {
        if (sActiveActivity != null) {
            sActiveActivity.resumeScanning();
        }
    }

    public static void stop() {
        if (sActiveActivity != null) {
            sActiveActivity.stopScanning();
        }
    }

    public static void start() {
        if (sActiveActivity != null) {
            sActiveActivity.startScanning();
        }
    }
    
    public static void torch(boolean enabled) {
        if (sActiveActivity != null) {
            sActiveActivity.switchTorchOn(enabled);
        }
    }
}
