package com.mirasense.scanditsdk.plugin;

import android.os.Bundle;
import android.util.Log;

import com.mirasense.scanditsdk.ScanditSDKScanSettings;
import com.scandit.barcodepicker.BarcodePicker;
import com.scandit.barcodepicker.ScanOverlay;
import com.scandit.barcodepicker.ScanSettings;
import com.scandit.recognition.Barcode;
import com.scandit.recognition.SymbologySettings;


public class ScanditSDKParameterParser {

    public static final String paramAppKey = "appKey".toLowerCase();
    public static final String paramContinuousMode = "continuousMode".toLowerCase();
    public static final String paramPortraitMargins = "portraitMargins".toLowerCase();
    public static final String paramLandscapeMargins = "landscapeMargins".toLowerCase();
    public static final String paramAnimationDuration = "animationDuration".toLowerCase();

    public static final String paramPaused = "paused".toLowerCase();

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
    public static final String paramCode11 = "code11".toLowerCase();
    public static final String paramQR = "qr".toLowerCase();
    public static final String paramDatamatrix = "datamatrix".toLowerCase();
    public static final String paramPdf417 = "pdf417".toLowerCase();
    public static final String paramAztec = "aztec".toLowerCase();
    public static final String paramMaxiCode = "maxiCode".toLowerCase();
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
    public static final String paramTorchButtonMarginsAndSize = "torchButtonMarginsAndSize".toLowerCase();
    public static final String paramCameraSwitchVisibility = "cameraSwitchVisibility".toLowerCase();
    public static final String paramCameraSwitchVisibilityTablet = "tablet".toLowerCase();
    public static final String paramCameraSwitchVisibilityAlways = "always".toLowerCase();
    public static final String paramCameraSwitchButtonPositionAndSize = "cameraSwitchButtonPositionAndSize".toLowerCase();
    public static final String paramCameraSwitchButtonMarginsAndSize = "cameraSwitchButtonMarginsAndSize".toLowerCase();

    public static final String paramSearchBarPlaceholderText = "searchBarPlaceholderText".toLowerCase();

    public static final String paramViewfinder = "viewfinder".toLowerCase();
    public static final String paramViewfinderDimension = "viewfinderDimension".toLowerCase();
    public static final String paramViewfinderSize = "viewfinderSize".toLowerCase();
    public static final String paramViewfinderTextHook = "viewfinderTextHook".toLowerCase();
    public static final String paramViewfinderColor = "viewfinderColor".toLowerCase();
    public static final String paramViewfinderDecodedColor = "viewfinderDecodedColor".toLowerCase();
    public static final String paramLogoOffsets = "logoOffsets".toLowerCase();
    public static final String paramZoom = "zoom".toLowerCase();
    
    public static final String paramGuiStyle = "guiStyle".toLowerCase();
    public static final String paramGuiStyleLaser = "laser".toLowerCase();
    
    public static final String paramDeviceName = "deviceName".toLowerCase();
    
    public static ScanSettings settingsForBundle(Bundle bundle) {
        
        ScanditSDKScanSettings oldSettings = ScanditSDKScanSettings.getPre43DefaultSettings();
        ScanSettings settings = oldSettings.getScanSettings();

        int facing = ScanSettings.CAMERA_FACING_BACK;
        if (bundle.containsKey(paramPreferFrontCamera) && bundle.getBoolean(paramPreferFrontCamera)) {
            facing = ScanSettings.CAMERA_FACING_FRONT;
        }
        settings.setCameraFacingPreference(facing);
        
        if (bundleContainsStringKey(bundle, paramDeviceName)) {
            settings.setDeviceName(bundle.getString(paramDeviceName));
        }
        
        if (bundle.containsKey(param1DScanning) && bundle.getBoolean(param1DScanning)) {
            Log.e("ScanditSDK", "The parameter '1DScanning' is deprecated. Please enable symbologies individually instead");
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_EAN13, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_UPCA, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_UPCE, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_EAN8, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODE39, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODE128, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODE93, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_INTERLEAVED_2_OF_5, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_MSI_PLESSEY, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODABAR, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_GS1_DATABAR, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_GS1_DATABAR_EXPANDED, true);
        }
        if (bundle.containsKey(param2DScanning) && bundle.getBoolean(param2DScanning)) {
            Log.e("ScanditSDK", "The parameter '2DScanning' is deprecated. Please enable symbologies individually instead");
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_AZTEC, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_DATA_MATRIX, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_QR, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_PDF417, true);
        }

        if ((bundle.containsKey(paramEan13AndUpc12) && bundle.getBoolean(paramEan13AndUpc12))
                || !bundle.containsKey(paramEan13AndUpc12)) {
            //Log.e("ScanditSDK", "The parameter 'ean13AndUpc12' is deprecated. Please enable the symbologies individually instead");
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_EAN13, true);
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_UPCA, true);
        }
        if ((bundle.containsKey(paramEan8) && bundle.getBoolean(paramEan8))
                || !bundle.containsKey(paramEan8)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_EAN8, true);
        }
        if ((bundle.containsKey(paramUpce) && bundle.getBoolean(paramUpce))
                || !bundle.containsKey(paramUpce)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_UPCE, true);
        }
        if ((bundle.containsKey(paramCode39) && bundle.getBoolean(paramCode39))
                || !bundle.containsKey(paramCode39)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODE39, true);
        }
        if ((bundle.containsKey(paramCode93) && bundle.getBoolean(paramCode93))
                || !bundle.containsKey(paramCode93)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODE93, true);
        }
        if ((bundle.containsKey(paramCode128) && bundle.getBoolean(paramCode128))
                || !bundle.containsKey(paramCode128)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODE128, true);
        }
        if (bundle.containsKey(paramItf) && bundle.getBoolean(paramItf)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_INTERLEAVED_2_OF_5, true);
        }
        if (bundle.containsKey(paramGS1Databar) && bundle.getBoolean(paramGS1Databar)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_GS1_DATABAR, true);
        }
        if (bundle.containsKey(paramGS1DatabarExpanded) && bundle.getBoolean(paramGS1DatabarExpanded)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_GS1_DATABAR_EXPANDED, true);
        }
        if (bundle.containsKey(paramCodabar) && bundle.getBoolean(paramCodabar)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODABAR, true);
        }
        if ((bundle.containsKey(paramQR) && bundle.getBoolean(paramQR))
                || !bundle.containsKey(paramQR)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_QR, true);
        }
        if ((bundle.containsKey(paramDatamatrix) && bundle.getBoolean(paramDatamatrix))
                || !bundle.containsKey(paramDatamatrix)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_DATA_MATRIX, true);
        }
        if (bundle.containsKey(paramPdf417) && bundle.getBoolean(paramPdf417)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_PDF417, true);
        }
        if (bundle.containsKey(paramAztec) && bundle.getBoolean(paramAztec)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_AZTEC, true);
        }
        if (bundle.containsKey(paramMsiPlessey) && bundle.getBoolean(paramMsiPlessey)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_MSI_PLESSEY, true);
        }
        if (bundle.containsKey(paramCode11) && bundle.getBoolean(paramCode11)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_CODE11, true);
        }
        if (bundle.containsKey(paramMaxiCode) && bundle.getBoolean(paramMaxiCode)) {
            settings.setSymbologyEnabled(Barcode.SYMBOLOGY_MAXICODE, true);
        }
        if (bundleContainsStringKey(bundle, paramMsiPlesseyChecksumType)) {
            String checksum = bundle.getString(paramMsiPlesseyChecksumType);
            int actualChecksum = SymbologySettings.CHECKSUM_MOD_10;
            if (checksum.equals(paramMsiPlesseyChecksumTypeNone)) {
                actualChecksum = SymbologySettings.CHECKSUM_NONE;
            } else if (checksum.equals(paramMsiPlesseyChecksumTypeMod11)) {
                actualChecksum = SymbologySettings.CHECKSUM_MOD_11;
            } else if (checksum.equals(paramMsiPlesseyChecksumTypeMod1010)) {
                actualChecksum = SymbologySettings.CHECKSUM_MOD_1010;
            } else if (checksum.equals(paramMsiPlesseyChecksumTypeMod1110)) {
                actualChecksum = SymbologySettings.CHECKSUM_MOD_1110;
            }
            SymbologySettings symbSettings = settings.getSymbologySettings(Barcode.SYMBOLOGY_MSI_PLESSEY);
            symbSettings.setChecksums(actualChecksum);
        }
        
        if (bundle.containsKey(paramInverseRecognition)) {
            SymbologySettings symbSettingsQr = settings.getSymbologySettings(Barcode.SYMBOLOGY_QR);
            SymbologySettings symbSettingsDm = settings.getSymbologySettings(Barcode.SYMBOLOGY_DATA_MATRIX);

            symbSettingsQr.setColorInvertedEnabled(bundle.getBoolean(paramInverseRecognition));
            symbSettingsDm.setColorInvertedEnabled(bundle.getBoolean(paramInverseRecognition));
        }
        if (bundle.containsKey(paramMicroDataMatrix)) {
            settings.setMicroDataMatrixEnabled(bundle.getBoolean(paramMicroDataMatrix));
        }
        
        if (bundle.containsKey(paramForce2D)) {
            settings.setForce2dRecognitionEnabled(bundle.getBoolean(paramForce2D));
        }
        
        if (bundle.containsKey(paramCodeDuplicateFilter)) {
            settings.setCodeDuplicateFilter(bundle.getInt(paramCodeDuplicateFilter));
        }
        
        if (bundleContainsStringKey(bundle, paramScanningHotSpot)) {
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
            settings.setRestrictedAreaScanningEnabled(true);
            settings.setScanningHotSpotHeight((float) bundle.getDouble(paramScanningHotSpotHeight));
        }

        if (bundle.containsKey(paramZoom)) {
            settings.setRelativeZoom(bundle.getFloat(paramZoom));
        }

        return settings;
    }

    public static void updatePickerUIFromBundle(SearchBarBarcodePicker picker, Bundle bundle,
                                                int screenWidth, int screenHeight) {
        if (bundle.containsKey(paramSearchBar)) {
            picker.showSearchBar(bundle.getBoolean(paramSearchBar));
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
        if (bundleContainsStringKey(bundle, paramTorchButtonPositionAndSize)) {
            String hotspot = bundle.getString(paramTorchButtonPositionAndSize);
            String[] split = hotspot.split("[/]");
            if (split.length == 4) {
                try {
                    Float x = Float.valueOf(split[0]);
                    Float y = Float.valueOf(split[1]);
                    int width = Integer.valueOf(split[2]);
                    int height = Integer.valueOf(split[3]);
                    picker.getOverlayView().setTorchButtonMarginsAndSize(
                            (int) (x * screenWidth), (int) (y * screenHeight), width, height);
                } catch (NumberFormatException e) {}
            }
        }
        if (bundleContainsStringKey(bundle, paramTorchButtonMarginsAndSize)) {
            String hotspot = bundle.getString(paramTorchButtonMarginsAndSize);
            String[] split = hotspot.split("[/]");
            if (split.length == 4) {
                try {
                    int x = Integer.valueOf(split[0]);
                    int y = Integer.valueOf(split[1]);
                    int width = Integer.valueOf(split[2]);
                    int height = Integer.valueOf(split[3]);
                    picker.getOverlayView().setTorchButtonMarginsAndSize(x, y, width, height);
                } catch (NumberFormatException e) {}
            }
        }
        
        if (bundleContainsStringKey(bundle, paramCameraSwitchVisibility)) {
            String visibility = bundle.getString(paramCameraSwitchVisibility);
            int actualVisibility = ScanOverlay.CAMERA_SWITCH_NEVER;
            if (visibility.equals(paramCameraSwitchVisibilityTablet)) {
                actualVisibility = ScanOverlay.CAMERA_SWITCH_ON_TABLET;
            } else if (visibility.equals(paramCameraSwitchVisibilityAlways)) {
                actualVisibility = ScanOverlay.CAMERA_SWITCH_ALWAYS;
            }
            picker.getOverlayView().setCameraSwitchVisibility(actualVisibility);
        }
        if (bundleContainsStringKey(bundle, paramCameraSwitchButtonPositionAndSize)) {
            String hotspot = bundle.getString(paramCameraSwitchButtonPositionAndSize);
            String[] split = hotspot.split("[/]");
            if (split.length == 4) {
                try {
                    Float x = Float.valueOf(split[0]);
                    Float y = Float.valueOf(split[1]);
                    int width = Integer.valueOf(split[2]);
                    int height = Integer.valueOf(split[3]);
                    picker.getOverlayView().setCameraSwitchButtonMarginsAndSize(
                            (int) (x * screenWidth), (int) (y * screenHeight), width, height);
                } catch (NumberFormatException e) {}
            }
        }
        if (bundleContainsStringKey(bundle, paramCameraSwitchButtonMarginsAndSize)) {
            String hotspot = bundle.getString(paramCameraSwitchButtonMarginsAndSize);
            String[] split = hotspot.split("[/]");
            if (split.length == 4) {
                try {
                    int x = Integer.valueOf(split[0]);
                    int y = Integer.valueOf(split[1]);
                    int width = Integer.valueOf(split[2]);
                    int height = Integer.valueOf(split[3]);
                    picker.getOverlayView().setCameraSwitchButtonMarginsAndSize(x, y, width, height);
                } catch (NumberFormatException e) {}
            }
        }
        
        if (bundleContainsStringKey(bundle, paramSearchBarPlaceholderText)) {
            picker.setSearchBarPlaceholderText(
                    bundle.getString(paramSearchBarPlaceholderText));
        }
        
        if (bundleContainsStringKey(bundle, paramViewfinderDimension)
            || bundleContainsStringKey(bundle, paramViewfinderSize)) {
            String hotspot = "";
            if (bundle.containsKey(paramViewfinderDimension)) {
                hotspot = bundle.getString(paramViewfinderDimension);
            } else if (bundle.containsKey(paramViewfinderSize)) {
                hotspot = bundle.getString(paramViewfinderSize);
            }
            String[] split = hotspot.split("[/]");
            if (split.length == 2) {
                try {
                    Float width = Float.valueOf(split[0]);
                    Float height = Float.valueOf(split[1]);
                    picker.getOverlayView().setViewfinderDimension(width, height, width, height);
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
        
        if (bundleContainsStringKey(bundle, paramViewfinderColor)) {
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
        if (bundleContainsStringKey(bundle, paramViewfinderDecodedColor)) {
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
        if (bundle.containsKey(paramViewfinder)) {
            picker.getOverlayView().drawViewfinder(bundle.getBoolean(paramViewfinder));
        }
        if (bundleContainsStringKey(bundle, paramLogoOffsets)) {
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
        
        if (bundleContainsStringKey(bundle, paramGuiStyle)) {
            String guiStyle = bundle.getString(paramGuiStyle);
            if (guiStyle.equals(paramGuiStyleLaser)) {
                picker.getOverlayView().setGuiStyle(ScanOverlay.GUI_STYLE_LASER);
            } else {
                picker.getOverlayView().setGuiStyle(ScanOverlay.GUI_STYLE_DEFAULT);
            }
        }
    }
    
    private static boolean bundleContainsStringKey(Bundle bundle, String key) {
        return (bundle.containsKey(key) && bundle.getString(key) != null);
    }
}

