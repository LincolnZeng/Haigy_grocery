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

#import "ScanditSDK.h"
#import "ScanditSDKRotatingBarcodePicker.h"
#import "ScanditSDKParameterParser.h"
#import "ScanditSDKSearchBar.h"

#import <ScanditBarcodeScanner/ScanditBarcodeScanner.h>


@interface ScanditSDK () <SBSScanDelegate, SBSOverlayControllerDidCancelDelegate, ScanditSDKSearchBarDelegate>
@property (nonatomic, copy) NSString *callbackId;
@property (readwrite, assign) BOOL hasPendingOperation;
@property (nonatomic, assign) BOOL continuousMode;
@property (nonatomic, assign) BOOL modallyPresented;
@property (nonatomic, assign) BOOL startAnimationDone;
@property (nonatomic, strong) SBSCode *bufferedResult;
@property (nonatomic, strong) ScanditSDKRotatingBarcodePicker *scanditBarcodePicker;
@end


@implementation ScanditSDK

@synthesize hasPendingOperation;

- (void)scan:(CDVInvokedUrlCommand *)command {
    if (self.hasPendingOperation) {
        return;
    }
    self.hasPendingOperation = YES;
    
    NSUInteger argc = [command.arguments count];
    if (argc < 2) {
        NSLog(@"The scan call received too few arguments and has to return without starting.");
        return;
    }
    self.callbackId = command.callbackId;
    
    NSString *appKey = [command.arguments objectAtIndex:0];
    [SBSLicense setAppKey:appKey];
    
    NSDictionary *options = [self lowerCaseOptionsFromOptions:[command.arguments objectAtIndex:1]];

    // Continuous mode support
    self.continuousMode = NO;
    NSObject *continuousMode = [options objectForKey:[ScanditSDKParameterParser paramContinuousMode]];
    if (continuousMode && [continuousMode isKindOfClass:[NSNumber class]]) {
        self.continuousMode = [((NSNumber *)continuousMode) boolValue];
    }
	
    
    self.scanditBarcodePicker = [[ScanditSDKRotatingBarcodePicker alloc]
                                 initWithSettings:[ScanditSDKParameterParser settingsForOptions:options]];
    
    NSObject *orientationsObj = [options objectForKey:[ScanditSDKParameterParser paramOrientations]];
    if (orientationsObj && [orientationsObj isKindOfClass:[NSString class]]) {
        NSUInteger allowedOrientations = 0;
        NSString *orientationsString = (NSString *)orientationsObj;
        if ([orientationsString rangeOfString:[ScanditSDKParameterParser paramOrientationsPortrait]].location != NSNotFound) {
            allowedOrientations = allowedOrientations | (1 << UIInterfaceOrientationPortrait);
        }
        if ([orientationsString rangeOfString:[ScanditSDKParameterParser paramOrientationsPortraitUpsideDown]].location != NSNotFound) {
            allowedOrientations = allowedOrientations | (1 << UIInterfaceOrientationPortraitUpsideDown);
        }
        if ([orientationsString rangeOfString:[ScanditSDKParameterParser paramOrientationsLandscapeLeft]].location != NSNotFound) {
            allowedOrientations = allowedOrientations | (1 << UIInterfaceOrientationLandscapeLeft);
        }
        if ([orientationsString rangeOfString:[ScanditSDKParameterParser paramOrientationsLandscapeRight]].location != NSNotFound) {
            allowedOrientations = allowedOrientations | (1 << UIInterfaceOrientationLandscapeRight);
        }
        self.scanditBarcodePicker.allowedInterfaceOrientations = allowedOrientations;
    }
	
    NSObject *searchBar = [options objectForKey:[ScanditSDKParameterParser paramSearchBar]];
    if (searchBar && [searchBar isKindOfClass:[NSNumber class]]) {
        [self.scanditBarcodePicker showSearchBar:[((NSNumber *)searchBar) boolValue]];
        self.scanditBarcodePicker.searchDelegate = self;
    }
    
    NSObject *t5 = [options objectForKey:[ScanditSDKParameterParser paramSearchBarActionButtonCaption]];
    if (t5 && [t5 isKindOfClass:[NSString class]]) {
        self.scanditBarcodePicker.manualSearchBar.goButtonCaption = (NSString *) t5;
    }
    NSObject *t6 = [options objectForKey:[ScanditSDKParameterParser paramSearchBarCancelButtonCaption]];
    if (t6 && [t6 isKindOfClass:[NSString class]]) {
        self.scanditBarcodePicker.manualSearchBar.cancelButtonCaption = (NSString *) t6;
    }
    NSObject *t7 = [options objectForKey:[ScanditSDKParameterParser paramSearchBarPlaceholderText]];
    if (t7 && [t7 isKindOfClass:[NSString class]]) {
        self.scanditBarcodePicker.manualSearchBar.placeholder = (NSString *) t7;
    }
    
    NSObject *minManual = [options objectForKey:[ScanditSDKParameterParser paramMinSearchBarBarcodeLength]];
    if (minManual && [minManual isKindOfClass:[NSNumber class]]) {
        self.scanditBarcodePicker.manualSearchBar.minTextLengthForSearch = [((NSNumber *) minManual) integerValue];
    }
    NSObject *maxManual = [options objectForKey:[ScanditSDKParameterParser paramMaxSearchBarBarcodeLength]];
    if (maxManual && [maxManual isKindOfClass:[NSNumber class]]) {
        self.scanditBarcodePicker.manualSearchBar.maxTextLengthForSearch = [((NSNumber *) maxManual) integerValue];
    }
    
    [ScanditSDKParameterParser updatePickerUI:self.scanditBarcodePicker fromOptions:options];
    
    // Set this class as the delegate for the overlay controller. It will now receive events when
    // a barcode was successfully scanned, manually entered or the cancel button was pressed.
    self.scanditBarcodePicker.scanDelegate = self;
    self.scanditBarcodePicker.overlayController.cancelDelegate = self;
    
    if ([options objectForKey:[ScanditSDKParameterParser paramPortraitMargins]]
            || [options objectForKey:[ScanditSDKParameterParser paramLandscapeMargins]]) {
        self.modallyPresented = NO;
        [self.viewController addChildViewController:self.scanditBarcodePicker];
        [self.viewController.view addSubview:self.scanditBarcodePicker.view];
        [self.scanditBarcodePicker didMoveToParentViewController:self.viewController];
        
        [self adjustLayoutWithOptions:options animationDuration:0];
        
    } else {
        self.modallyPresented = YES;
        
        // Show the toolbar that contains a cancel button.
        [self.scanditBarcodePicker.overlayController showToolBar:YES];
        
        self.startAnimationDone = NO;
        self.bufferedResult = nil;
        
        // Present the barcode picker modally and start scanning.
        [self.viewController presentViewController:self.scanditBarcodePicker animated:YES completion:^{
            self.startAnimationDone = YES;
            if (self.bufferedResult != nil) {
                [self performSelector:@selector(returnBuffer) withObject:nil afterDelay:0.01];
            }
        }];
    }
    
    [self.scanditBarcodePicker performSelector:@selector(startScanning) withObject:nil afterDelay:0.1];
}

- (void)returnBuffer {
    if (self.bufferedResult != nil) {
        [self scannedCode:self.bufferedResult.data
              ofSymbology:self.bufferedResult.symbologyString
                inSession:nil];
        
        self.bufferedResult = nil;
    }
}

- (void)cancel:(CDVInvokedUrlCommand *)command {
    if (self.scanditBarcodePicker) {
        [self overlayController:self.scanditBarcodePicker.overlayController didCancelWithStatus:nil];
    }
}

- (void)pause:(CDVInvokedUrlCommand *)command {
    [self.scanditBarcodePicker pauseScanning];
}

- (void)resume:(CDVInvokedUrlCommand *)command {
    [self.scanditBarcodePicker resumeScanning];
}

- (void)start:(CDVInvokedUrlCommand *)command {
    [self.scanditBarcodePicker startScanning];
}

- (void)stop:(CDVInvokedUrlCommand *)command {
    [self.scanditBarcodePicker stopScanning];
}

- (void)resize:(CDVInvokedUrlCommand *)command {
    dispatch_main_sync_safe(^{
        if (self.scanditBarcodePicker && !self.modallyPresented) {
            NSUInteger argc = [command.arguments count];
            if (argc < 1) {
                NSLog(@"The resize call received too few arguments and has to return without starting.");
                return;
            }
            
            NSDictionary *options = [self lowerCaseOptionsFromOptions:[command.arguments objectAtIndex:0]];
            
            [ScanditSDKParameterParser updatePickerUI:self.scanditBarcodePicker fromOptions:options];
            
            CGFloat animation = 0;
            NSObject *animationDuration = [options objectForKey:[ScanditSDKParameterParser paramAnimationDuration]];
            if (animationDuration && [animationDuration isKindOfClass:[NSNumber class]]) {
                animation = [((NSNumber *)animationDuration) floatValue];
            }
            [self adjustLayoutWithOptions:options animationDuration:animation];
        }
    });
}

- (void)adjustLayoutWithOptions:(NSDictionary *)options animationDuration:(CGFloat)animationDuration {
    NSObject *portraitMargins = [options objectForKey:[ScanditSDKParameterParser paramPortraitMargins]];
    NSObject *landscapeMargins = [options objectForKey:[ScanditSDKParameterParser paramLandscapeMargins]];
    if (portraitMargins || landscapeMargins) {
        self.scanditBarcodePicker.portraitMargins = CGRectMake(0, 0, 0, 0);
        self.scanditBarcodePicker.landscapeMargins = CGRectMake(0, 0, 0, 0);
    }
    
    if (portraitMargins) {
        CGRect margins = [ScanditSDKParameterParser rectFromParameter:portraitMargins];
        self.scanditBarcodePicker.portraitMargins = margins;
    }
    if (landscapeMargins) {
        CGRect margins = [ScanditSDKParameterParser rectFromParameter:landscapeMargins];
        self.scanditBarcodePicker.landscapeMargins = margins;
    }
    
    [self.scanditBarcodePicker adjustSize:animationDuration];
}

- (void)torch:(CDVInvokedUrlCommand *)command {
    NSUInteger argc = [command.arguments count];
    if (argc < 1) {
        NSLog(@"The torch call received too few arguments and has to return without starting.");
        return;
    }
    NSNumber *enabled = [command.arguments objectAtIndex:0];
    [self.scanditBarcodePicker switchTorchOn:[enabled boolValue]];
}


#pragma mark - Utilities

- (NSDictionary *)lowerCaseOptionsFromOptions:(NSDictionary *)options {
    NSMutableDictionary *result = [NSMutableDictionary dictionary];
    for (NSString *key in options) {
        [result setObject:[options objectForKey:key] forKey:[key lowercaseString]];
    }
    return result;
}


#pragma mark - SBSScanDelegate methods


- (void)barcodePicker:(SBSBarcodePicker *)picker didScan:(SBSScanSession *)session {
    NSArray *newCodes = session.newlyRecognizedCodes;
    SBSCode *code = [newCodes firstObject];
    
    if (self.modallyPresented) {
        if (!self.startAnimationDone) {
            // If the initial animation hasn't finished yet we buffer the result and return it as soon
            // as the animation finishes.
            self.bufferedResult = code;
            return;
        } else {
            self.bufferedResult = nil;
        }
    }
    
    [self scannedCode:code.data ofSymbology:code.symbologyString inSession:session];
}

- (void)scannedCode:(NSString *)data
        ofSymbology:(NSString *)symbologyString
          inSession:(SBSScanSession *)session {
    NSArray *result = [[NSArray alloc] initWithObjects:data, symbologyString, nil];
    
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                       messageAsArray:result];
    
    if (!self.continuousMode) {
        if (session) {
            [session stopScanning];
        } else {
            [self.scanditBarcodePicker stopScanning];
        }
        dispatch_main_sync_safe(^{
            if (self.modallyPresented) {
                [self.viewController dismissViewControllerAnimated:YES completion:nil];
            } else {
                [self.scanditBarcodePicker removeFromParentViewController];
                [self.scanditBarcodePicker.view removeFromSuperview];
                [self.scanditBarcodePicker didMoveToParentViewController:nil];
            }
            self.scanditBarcodePicker = nil;
            self.hasPendingOperation = NO;
        });
    } else {
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
    }
	
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
}


#pragma mark - SBSOverlayControllerDidCancelDelegate

- (void)overlayController:(SBSOverlayController *)overlayController
      didCancelWithStatus:(NSDictionary *)status {
    [self.scanditBarcodePicker stopScanning];
    if (self.modallyPresented) {
        [self.viewController dismissViewControllerAnimated:YES completion:nil];
    } else {
        [self.scanditBarcodePicker removeFromParentViewController];
        [self.scanditBarcodePicker.view removeFromSuperview];
        [self.scanditBarcodePicker didMoveToParentViewController:nil];
    }
	self.scanditBarcodePicker = nil;
    
	CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                      messageAsString:@"Canceled"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId]; 
    self.hasPendingOperation = NO;
}


#pragma mark - ScanditSDKSearchBarDelegate

- (void)searchExecutedWithContent:(NSString *)content {
    NSArray *result = [[NSArray alloc] initWithObjects:content, @"UNKNOWN", nil];
    
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                       messageAsArray:result];
    if (!self.continuousMode) {
        [self.scanditBarcodePicker stopScanning];
        if (self.modallyPresented) {
            [self.viewController dismissViewControllerAnimated:YES completion:nil];
        } else {
            [self.scanditBarcodePicker removeFromParentViewController];
            [self.scanditBarcodePicker.view removeFromSuperview];
            [self.scanditBarcodePicker didMoveToParentViewController:nil];
        }
        self.scanditBarcodePicker = nil;
        self.hasPendingOperation = NO;
    } else {
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
        [self.scanditBarcodePicker.overlayController resetUI];
    }
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
}



@end
