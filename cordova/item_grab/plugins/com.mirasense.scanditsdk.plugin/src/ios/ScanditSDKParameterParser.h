//
//  ScanditSDKParameterParser.h
//  Hello World
//
//  Created by Moritz Hartmeier on 10/06/15.
//
//

#import <Foundation/Foundation.h>

#import <ScanditBarcodeScanner/ScanditBarcodeScanner.h>


@interface ScanditSDKParameterParser : NSObject

+ (NSString *)paramAppKey;
+ (NSString *)paramContinuousMode;
+ (NSString *)paramPortraitMargins;
+ (NSString *)paramLandscapeMargins;
+ (NSString *)paramAnimationDuration;
+ (NSString *)paramPreferFrontCamera;

+ (NSString *)paramPaused;

+ (NSString *)paramOrientations;
+ (NSString *)paramOrientationsPortrait;
+ (NSString *)paramOrientationsPortraitUpsideDown;
+ (NSString *)paramOrientationsLandscapeLeft;
+ (NSString *)paramOrientationsLandscapeRight;

+ (NSString *)paramSearchBar;
+ (NSString *)paramSearchBarActionButtonCaption;
+ (NSString *)paramSearchBarCancelButtonCaption;
+ (NSString *)paramSearchBarPlaceholderText;
+ (NSString *)paramMinSearchBarBarcodeLength;
+ (NSString *)paramMaxSearchBarBarcodeLength;

+ (SBSScanSettings *)settingsForOptions:(NSDictionary *)options;

+ (void)updatePickerUI:(SBSBarcodePicker *)picker fromOptions:(NSDictionary *)options;

+ (CGRect)rectFromParameter:(NSObject *)parameter;

@end
