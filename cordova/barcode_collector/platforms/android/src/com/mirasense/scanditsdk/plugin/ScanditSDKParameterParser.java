package com.mirasense.scanditsdk.plugin;

import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;
import com.mirasense.scanditsdk.LegacyPortraitScanditSDKBarcodePicker;
import com.mirasense.scanditsdk.ScanditSDKBarcodePicker;
import com.mirasense.scanditsdk.ScanditSDKScanSettings;
import com.mirasense.scanditsdk.interfaces.*;
import com.mirasense.scanditsdk.interfaces.ScanditSDK;
import com.mirasense.scanditsdk.internal.ScanditSDKGlobals;


public class ScanditSDKParameterParser {

    public static final String paramAppKey = "appKey".toLowerCase();
    public static final String paramContinuousMode = "continuousMode".toLowerCase();
    public static final String paramPortraitMargins = "portraitMargins".toLowerCase();
    public static final String paramLandscapeMargins = "landscapeMargins".toLowerCase();
    public static final String paramAnimationDuration = "animationDuration".toLowerCase();

    public static final String paramPreferFrontCamera = "preferFrontCamera".toLowerCase();
    public static final String param1DScanning = "1DScanning".toLowerCase();
    public static final String param2DScanning = "2DScanning".toLowerCase();
    public static final String paramEan13AndUpc12 = "ean13AndUpc12".toLowerCase();
    public static final String paramEan8 = "ean8".toLowerCase();
    public static final String paramUpce = "upce".toLowerCase();
    public static final String paramCode39 = "code39".toLowerCase();
    public static final String paramCode93 = "code93".toLowerCase();
    public static final String paramCode128 = "code128".toLowerCase();
    public static final String paramItf = "itf".toLowerCase();
    public static final String paramGS1Databar = "gs1Databar".toLowerCase();
    public static final String paramGS1DatabarExpanded = "gs1DatabarExpanded".toLowerCase();
    public static final String paramCodabar = "codabar".toLowerCase();
    public static final String paramQR = "qr".toLowerCase();
    public static final String paramDatamatrix = "datamatrix".toLowerCase();
    public static final String paramPdf417 = "pdf417".toLowerCase();
    public static final String paramAztec = "aztec".toLowerCase();
    public static final String paramMsiPlessey = "msiPlessey".toLowerCase();
    public static final String paramMsiPlesseyChecksumType = "msiPlesseyChecksumType".toLowerCase();
    public static final String paramMsiPlesseyChecksumTypeNone = "none".toLowerCase();
    public static final String paramMsiPlesseyChecksumTypeMod11 = "mod11".toLowerCase();
    public static final String paramMsiPlesseyChecksumTypeMod1010 = "mod1010".toLowerCase();
    public static final String paramMsiPlesseyChecksumTypeMod1110 = "mod1110".toLowerCase();
    public static final String paramInverseRecognition = "inverseRecognition".toLowerCase();
    public static final String paramMicroDataMatrix = "microDataMatrix".toLowerCase();
    public static final String paramForce2D = "force2d".toLowerCase();
    public static final String paramCodeDuplicateFilter = "codeDuplicateFilter".toLowerCase();
    public static final String paramScanningHotSpot = "scanningHotSpot".toLowerCase();
    public static final String paramScanningHotSpotHeight = "scanningHotSpotHeight".toLowerCase();

    public static final String paramSearchBar = "searchBar".toLowerCase();
    public static final String paramBeep = "beep".toLowerCase();
    public static final String paramVibrate = "vibrate".toLowerCase();
    public static final String paramTorch = "torch".toLowerCase();
    public static final String paramTorchButtonPositionAndSize = "torchButtonPositionAndSize".toLowerCase();
    public static final String paramCameraSwitchVisibility = "cameraSwitchVisibility".toLowerCase();
    public static final String paramCameraSwitchVisibilityTablet = "tablet".toLowerCase();
    public static final String paramCameraSwitchVisibilityAlways = "always".toLowerCase();
    public static final String paramCameraSwitchButtonPositionAndSize = "cameraSwitchButtonPositionAndSize".toLowerCase();

    public static final String paramSearchBarPlaceholderText = "searchBarPlaceholderText".toLowerCase();

    public static final String paramViewfinderDimension = "viewfinderDimension".toLowerCase();
    public static final String paramViewfinderSize = "viewfinderSize".toLowerCase();
    public static final String paramViewfinderTextHook = "viewfinderTextHook".toLowerCase();
    public static final String paramViewfinderColor = "viewfinderColor".toLowerCase();
    public static final String paramViewfinderDecodedColor = "viewfinderDecodedColor".toLowerCase();
    public static final String paramLogoOffsets = "logoOffsets".toLowerCase();
    public static final String paramZoom = "zoom".toLowerCase();


    public static ScanditSDKScanSettings settingsForBundle(Bundle bundle) {

        ScanditSDKScanSettings settings = ScanditSDKScanSettings.getDefaultSettings();

        int facing = ScanditSDK.CAMERA_FACING_BACK;
        if (bundle.containsKey(paramPreferFrontCamera) && bundle.getBoolean(paramPreferFrontCamera)) {
            facing = ScanditSDK.CAMERA_FACING_FRONT;
        }
        settings.setCameraFacingPreference(facing);

        if (bundle.containsKey(param1DScanning) && bundle.getBoolean(param1DScanning)) {
            Log.e("ScanditSDK", "The parameter '1DScanning' is deprecated. Please enable symbologies individually instead");
            settings.enableSymbologies(new ScanditSDK.Symbology[]{
                    ScanditSDK.Symbology.EAN13, ScanditSDK.Symbology.UPC12, ScanditSDK.Symbology.EAN8,
                    ScanditSDK.Symbology.CODE128, ScanditSDK.Symbology.CODE39, ScanditSDK.Symbology.CODE93,
                    ScanditSDK.Symbology.ITF, ScanditSDK.Symbology.MSI_PLESSEY, ScanditSDK.Symbology.UPCE,
                    ScanditSDK.Symbology.CODABAR, ScanditSDK.Symbology.GS1_DATABAR,
                    ScanditSDK.Symbology.GS1_DATABAR_EXPANDED});
        }
        if (bundle.containsKey(param2DScanning) && bundle.getBoolean(param2DScanning)) {
            Log.e("ScanditSDK", "The parameter '2DScanning' is deprecated. Please enable symbologies individually instead");
            settings.enableSymbologies(new ScanditSDK.Symbology[]{
                    ScanditSDK.Symbology.AZTEC, ScanditSDK.Symbology.DATAMATRIX, ScanditSDK.Symbology.PDF417,
                    ScanditSDK.Symbology.QR});
        }

        if ((bundle.containsKey(paramEan13AndUpc12) && bundle.getBoolean(paramEan13AndUpc12))
                || !bundle.containsKey(paramEan13AndUpc12)) {
            //Log.e("ScanditSDK", "The parameter 'ean13AndUpc12' is deprecated. Please enable the symbologies individually instead");
            settings.enableSymbology(ScanditSDK.Symbology.EAN13);
            settings.enableSymbology(ScanditSDK.Symbology.UPC12);
        }
        if ((bundle.containsKey(paramEan8) && bundle.getBoolean(paramEan8))
                || !bundle.containsKey(paramEan8)) {
            settings.enableSymbology(ScanditSDK.Symbology.EAN8);
        }
        if ((bundle.containsKey(paramUpce) && bundle.getBoolean(paramUpce))
                || !bundle.containsKey(paramUpce)) {
            settings.enableSymbology(ScanditSDK.Symbology.UPCE);
        }
        if ((bundle.containsKey(paramCode39) && bundle.getBoolean(paramCode39))
                || !bundle.containsKey(paramCode39)) {
            settings.enableSymbology(ScanditSDK.Symbology.CODE39);
        }
        if ((bundle.containsKey(paramCode93) && bundle.getBoolean("code93"))
                || !bundle.containsKey(paramCode93)) {
            settings.enableSymbology(ScanditSDK.Symbology.CODE93);
        }
        if ((bundle.containsKey(paramCode128) && bundle.getBoolean(paramCode128))
                || !bundle.containsKey(paramCode128)) {
            settings.enableSymbology(ScanditSDK.Symbology.CODE128);
        }
        if (bundle.containsKey(paramItf) && bundle.getBoolean(paramItf)) {
            settings.enableSymbology(ScanditSDK.Symbology.ITF);
        }
        if (bundle.containsKey(paramGS1Databar) && bundle.getBoolean(paramGS1Databar)) {
            settings.enableSymbology(ScanditSDK.Symbology.GS1_DATABAR);
        }
        if (bundle.containsKey(paramGS1DatabarExpanded) && bundle.getBoolean(paramGS1DatabarExpanded)) {
            settings.enableSymbology(ScanditSDK.Symbology.GS1_DATABAR_EXPANDED);
        }
        if (bundle.containsKey(paramCodabar) && bundle.getBoolean(paramCodabar)) {
            settings.enableSymbology(ScanditSDK.Symbology.CODABAR);
        }
        if ((bundle.containsKey(paramQR) && bundle.getBoolean(paramQR))
                || !bundle.containsKey(paramQR)) {
            settings.enableSymbology(ScanditSDK.Symbology.QR);
        }
        if ((bundle.containsKey(paramDatamatrix) && bundle.getBoolean(paramDatamatrix))
                || !bundle.containsKey(paramDatamatrix)) {
            settings.enableSymbology(ScanditSDK.Symbology.DATAMATRIX);
        }
        if (bundle.containsKey(paramPdf417) && bundle.getBoolean(paramPdf417)) {
            settings.enableSymbology(ScanditSDK.Symbology.PDF417);
        }
        if (bundle.containsKey(paramAztec) && bundle.getBoolean(paramAztec)) {
            settings.enableSymbology(ScanditSDK.Symbology.AZTEC);
        }
        if (bundle.containsKey(paramMsiPlessey) && bundle.getBoolean(paramMsiPlessey)) {
            settings.enableSymbology(ScanditSDK.Symbology.MSI_PLESSEY);
        }
        if (bundle.containsKey(paramMsiPlesseyChecksumType)) {
            String checksum = bundle.getString(paramMsiPlesseyChecksumType);
            int actualChecksum = com.mirasense.scanditsdk.interfaces.ScanditSDK.CHECKSUM_MOD_10;
            if (checksum.equals(paramMsiPlesseyChecksumTypeNone)) {
                actualChecksum = com.mirasense.scanditsdk.interfaces.ScanditSDK.CHECKSUM_NONE;
            } else if (checksum.equals(paramMsiPlesseyChecksumTypeMod11)) {
                actualChecksum = com.mirasense.scanditsdk.interfaces.ScanditSDK.CHECKSUM_MOD_11;
            } else if (checksum.equals(paramMsiPlesseyChecksumTypeMod1010)) {
                actualChecksum = com.mirasense.scanditsdk.interfaces.ScanditSDK.CHECKSUM_MOD_1010;
            } else if (checksum.equals(paramMsiPlesseyChecksumTypeMod1110)) {
                actualChecksum = com.mirasense.scanditsdk.interfaces.ScanditSDK.CHECKSUM_MOD_1110;
            }
            settings.setMsiPlesseyChecksumType(actualChecksum);
        }

        if (bundle.containsKey(paramInverseRecognition)) {
            settings.enableColorInverted2dRecognition(bundle.getBoolean(paramInverseRecognition));
        }
        if (bundle.containsKey(paramMicroDataMatrix)) {
            settings.enableMicroDataMatrix(bundle.getBoolean(paramMicroDataMatrix));
        }

        if (bundle.containsKey(paramForce2D)) {
            settings.force2dRecognition(bundle.getBoolean(paramForce2D));
        }

        if (bundle.containsKey(paramCodeDuplicateFilter)) {
            settings.setCodeDuplicateFilter(bundle.getInt(paramCodeDuplicateFilter));
        }

        if (bundle.containsKey(paramScanningHotSpot)) {
            String hotspot = bundle.getString(paramScanningHotSpot);
            String[] split = hotspot.split("[/]");
            if (split.length == 2) {
                try {
                    Float x = Float.valueOf(split[0]);
                    Float y = Float.valueOf(split[1]);
                    settings.setScanningHotSpot(x, y);
                } catch (NumberFormatException e) {}
            }
        }

        if (bundle.containsKey(paramScanningHotSpotHeight)) {
            settings.enableRestrictedAreaScanning(true);
            settings.setScanningHotSpotHeight((float) bundle.getDouble(paramScanningHotSpotHeight));
        }

        return settings;
    }

    public static void updatePickerUIFromBundle(ScanditSDK picker, Bundle bundle) {
        if (bundle.containsKey(paramSearchBar)) {
            picker.getOverlayView().showSearchBar(bundle.getBoolean(paramSearchBar));
        }
        if (bundle.containsKey(paramBeep)) {
            picker.getOverlayView().setBeepEnabled(bundle.getBoolean(paramBeep));
        }
        if (bundle.containsKey(paramVibrate)) {
            picker.getOverlayView().setVibrateEnabled(bundle.getBoolean(paramVibrate));
        }
        if (bundle.containsKey(paramTorch)) {
            picker.getOverlayView().setTorchEnabled(bundle.getBoolean(paramTorch));
        }
        if (bundle.containsKey(paramTorchButtonPositionAndSize)) {
            String hotspot = bundle.getString(paramTorchButtonPositionAndSize);
            String[] split = hotspot.split("[/]");
            if (split.length == 4) {
                try {
                    Float x = Float.valueOf(split[0]);
                    Float y = Float.valueOf(split[1]);
                    int width = Integer.valueOf(split[2]);
                    int height = Integer.valueOf(split[3]);
                    picker.getOverlayView().setTorchButtonPosition(x, y, width, height);
                } catch (NumberFormatException e) {}
            }
        }

        if (bundle.containsKey(paramCameraSwitchVisibility)) {
            String visibility = bundle.getString(paramCameraSwitchVisibility);
            int actualVisibility = ScanditSDKOverlay.CAMERA_SWITCH_NEVER;
            if (visibility.equals(paramCameraSwitchVisibilityTablet)) {
                actualVisibility = ScanditSDKOverlay.CAMERA_SWITCH_ON_TABLET;
            } else if (visibility.equals(paramCameraSwitchVisibilityAlways)) {
                actualVisibility = ScanditSDKOverlay.CAMERA_SWITCH_ALWAYS;
            }
            picker.getOverlayView().setCameraSwitchVisibility(actualVisibility);
        }
        if (bundle.containsKey(paramCameraSwitchButtonPositionAndSize)) {
            String hotspot = bundle.getString(paramCameraSwitchButtonPositionAndSize);
            String[] split = hotspot.split("[/]");
            if (split.length == 4) {
                try {
                    Float x = Float.valueOf(split[0]);
                    Float y = Float.valueOf(split[1]);
                    int width = Integer.valueOf(split[2]);
                    int height = Integer.valueOf(split[3]);
                    picker.getOverlayView().setCameraSwitchButtonPosition(
                            x, y, width, height);
                } catch (NumberFormatException e) {}
            }
        }

        if (bundle.containsKey(paramSearchBarPlaceholderText)) {
            picker.getOverlayView().setSearchBarPlaceholderText(
                    bundle.getString(paramSearchBarPlaceholderText));
        }

        if (bundle.containsKey(paramViewfinderDimension)
                || bundle.containsKey(paramViewfinderDimension)) {
            String hotspot = "";
            if (bundle.containsKey(paramViewfinderDimension)) {
                hotspot = bundle.getString(paramViewfinderDimension);
            } else if (bundle.containsKey(paramViewfinderSize)) {
                hotspot = bundle.getString(paramViewfinderDimension);
            }
            String[] split = hotspot.split("[/]");
            if (split.length == 2) {
                try {
                    Float width = Float.valueOf(split[0]);
                    Float height = Float.valueOf(split[1]);
                    picker.getOverlayView().setViewfinderDimension(width, height);
                } catch (NumberFormatException e) {}
            } else if (split.length == 4) {
                try {
                    Float width = Float.valueOf(split[0]);
                    Float height = Float.valueOf(split[1]);
                    Float landscapeWidth = Float.valueOf(split[2]);
                    Float landscapeHeight = Float.valueOf(split[3]);
                    picker.getOverlayView().setViewfinderDimension(
                            width, height, landscapeWidth, landscapeHeight);
                } catch (NumberFormatException e) {}
            }
        }

        if (bundle.containsKey(paramViewfinderColor)) {
            String color = bundle.getString(paramViewfinderColor);
            if (color.length() == 6) {
                try {
                    String red = color.substring(0, 2);
                    String green = color.substring(2, 4);
                    String blue = color.substring(4, 6);
                    float r = ((float) Integer.parseInt(red, 16)) / 256.0f;
                    float g = ((float) Integer.parseInt(green, 16)) / 256.0f;
                    float b = ((float) Integer.parseInt(blue, 16)) / 256.0f;
                    picker.getOverlayView().setViewfinderColor(r, g, b);
                } catch (NumberFormatException e) {}
            }
        }
        if (bundle.containsKey(paramViewfinderDecodedColor)) {
            String color = bundle.getString(paramViewfinderDecodedColor);
            if (color.length() == 6) {
                try {
                    String red = color.substring(0, 2);
                    String green = color.substring(2, 4);
                    String blue = color.substring(4, 6);
                    float r = ((float) Integer.parseInt(red, 16)) / 256.0f;
                    float g = ((float) Integer.parseInt(green, 16)) / 256.0f;
                    float b = ((float) Integer.parseInt(blue, 16)) / 256.0f;
                    picker.getOverlayView().setViewfinderDecodedColor(r, g, b);
                } catch (NumberFormatException e) {}
            }
        }
        if (bundle.containsKey(paramLogoOffsets)) {
            String offsets = bundle.getString(paramLogoOffsets);
            String[] split = offsets.split("[,]");
            if (split.length == 4) {
                try {
                    Float xOffset = Float.valueOf(split[0].trim());
                    Float yOffset = Float.valueOf(split[1].trim());
                    Float landscapeXOffset = Float.valueOf(split[2].trim());
                    Float landscapeYOffset = Float.valueOf(split[3].trim());
                    picker.getOverlayView().setViewfinderDimension(
                            xOffset, yOffset, landscapeXOffset, landscapeYOffset);
                } catch (NumberFormatException e) {}
            }
        }
        if (bundle.containsKey(paramZoom)) {
            picker.setZoom(bundle.getFloat(paramZoom));
        }
    }
}
