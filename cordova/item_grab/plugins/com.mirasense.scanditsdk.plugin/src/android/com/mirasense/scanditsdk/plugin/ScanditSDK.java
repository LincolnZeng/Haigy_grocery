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

import com.scandit.barcodepicker.BarcodePicker;
import com.scandit.barcodepicker.OnScanListener;
import com.scandit.barcodepicker.ScanSession;
import com.scandit.barcodepicker.ScanSettings;
import com.scandit.barcodepicker.ScanditLicense;
import com.scandit.barcodepicker.internal.ScanditSDKGlobals;
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


public class ScanditSDK extends CordovaPlugin implements ScanditSDKResultRelayCallback,
        OnScanListener, SearchBarBarcodePicker.ScanditSDKSearchBarListener {

    public static final String SCAN = "scan";
    public static final String CANCEL = "cancel";
    public static final String PAUSE = "pause";
    public static final String RESUME = "resume";
    public static final String START = "start";
    public static final String STOP = "stop";
    public static final String RESIZE = "resize";
    public static final String TORCH = "torch";
    
    private CallbackContext mCallbackContext;
    private boolean mContinuousMode = false;
    private boolean mPendingOperation = false;

    private Rect mPortraitMargins = new Rect(0, 0, 0, 0);
    private Rect mLandscapeMargins = new Rect(0, 0, 0, 0);
    private final OrientationHandler mHandler = new OrientationHandler(Looper.getMainLooper());

    private SearchBarBarcodePicker mBarcodePicker;
    private RelativeLayout mLayout;

    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        PluginResult result = null;

        if (action.equals(SCAN)) {
            mCallbackContext = callbackContext;
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
        } else if (action.equals(TORCH)) {
            torch(args);
            return true;
        } else {
            result = new PluginResult(Status.INVALID_ACTION);
            callbackContext.error("Invalid Action: " + action);
            return false;
        }
    }

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

        ScanditLicense.setAppKey(bundle.getString(ScanditSDKParameterParser.paramAppKey));
        ScanditSDKGlobals.usedFramework = "phonegap";

        if (bundle.containsKey(ScanditSDKParameterParser.paramPortraitMargins)
                || bundle.containsKey(ScanditSDKParameterParser.paramLandscapeMargins)) {
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    ScanSettings settings = ScanditSDKParameterParser.settingsForBundle(bundle);
                    mBarcodePicker = new SearchBarBarcodePicker(cordova.getActivity(), settings);
                    mBarcodePicker.setOnScanListener(ScanditSDK.this);
                    mBarcodePicker.setOnSearchBarListener(ScanditSDK.this);
                    mLayout = new RelativeLayout(cordova.getActivity());

                    ViewGroup viewGroup = getViewGroupToAddTo();
                    if (viewGroup != null) {
                        viewGroup.addView(mLayout);
                    }

                    Display display = cordova.getActivity().getWindowManager().getDefaultDisplay();
                    ScanditSDKParameterParser.updatePickerUIFromBundle(mBarcodePicker, bundle,
                            display.getWidth(), display.getHeight());

                    RelativeLayout.LayoutParams rLayoutParams = new RelativeLayout.LayoutParams(
                            RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT);
                    mLayout.addView(mBarcodePicker, rLayoutParams);
                    adjustLayout(bundle, 0);

                    if (bundle.containsKey(ScanditSDKParameterParser.paramPaused)
                            && bundle.getBoolean(ScanditSDKParameterParser.paramPaused)) {
                        mBarcodePicker.startScanning(true);
                    } else {
                        mBarcodePicker.startScanning();
                    }
                }
            });

        } else {
            ScanditSDKResultRelay.setCallback(this);
            Intent intent = new Intent(cordova.getActivity(), ScanditSDKActivity.class);
            intent.putExtras(bundle);
            cordova.startActivityForResult(this, intent, 1);
        }
    }

    private void cancel(JSONArray data) {
        if (mBarcodePicker != null) {
            removeSubviewPicker();
            mPendingOperation = false;
            mHandler.stop();
            mCallbackContext.error("Canceled");
        } else {
            ScanditSDKActivity.cancel();
        }
    }

    private void pause(JSONArray data) {
        if (mBarcodePicker != null) {
            mBarcodePicker.pauseScanning();
        } else {
            ScanditSDKActivity.pause();
        }
    }

    private void resume(JSONArray data) {
        if (mBarcodePicker != null) {
            mBarcodePicker.resumeScanning();
        } else {
            ScanditSDKActivity.resume();
        }
    }

    private void stop(JSONArray data) {
        if (mBarcodePicker != null) {
            mBarcodePicker.stopScanning();
        } else {
            ScanditSDKActivity.stop();
        }
    }

    private void start(JSONArray data) {
        if (mBarcodePicker != null) {
            mBarcodePicker.startScanning();
        } else {
            ScanditSDKActivity.start();
        }
    }

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
                    Display display = cordova.getActivity().getWindowManager().getDefaultDisplay();
                    ScanditSDKParameterParser.updatePickerUIFromBundle(mBarcodePicker, bundle,
                            display.getWidth(), display.getHeight());
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
        if (mBarcodePicker == null) {
            return;
        }
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
                } else {
                    ScanditSDKActivity.torch(innerEnabled);
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
    public void didScan(ScanSession session) {
        if (session.getNewlyRecognizedCodes().size() > 0) {
            JSONArray args = new JSONArray();
            args.put(session.getNewlyRecognizedCodes().get(0).getData());
            args.put(session.getNewlyRecognizedCodes().get(0).getSymbologyName());
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
    }

    @Override
    public void didEnter(String entry) {
        JSONArray args = new JSONArray();
        args.put(entry);
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

    @Override
    public void onPause(boolean multitasking) {
        super.onPause(multitasking);

        if (mBarcodePicker != null) {
            mBarcodePicker.stopScanning();
        }
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);

        if (mBarcodePicker != null) {
            mBarcodePicker.startScanning();
        }
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
