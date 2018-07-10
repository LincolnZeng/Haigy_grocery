package com.mirasense.scanditsdk.plugin;

import android.content.Context;
import android.view.View;
import android.widget.RelativeLayout;

import com.scandit.barcodepicker.BarcodePicker;
import com.scandit.barcodepicker.ScanSettings;
import com.scandit.barcodepicker.internal.gui.view.SearchBar;

/**
 * Created by mo on 29/10/15.
 */
public class SearchBarBarcodePicker extends BarcodePicker {

    private ScanditSDKSearchBar mSearchBar;
    private ScanditSDKSearchBarListener mListener;


    public SearchBarBarcodePicker(Context context) {
        super(context);
    }

    public SearchBarBarcodePicker(Context context, ScanSettings settings) {
        super(context, settings);
    }

    public void setOnSearchBarListener(ScanditSDKSearchBarListener listener) {
        mListener = listener;
    }

    public void showSearchBar(boolean show) {
        if (show && mSearchBar == null) {
            mSearchBar = new ScanditSDKSearchBar(getContext(), new OnClickListener() {
                @Override
                public void onClick(View v) {
                    onSearchClicked();
                }
            });
            RelativeLayout.LayoutParams rParams = new RelativeLayout.LayoutParams(
                    LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
            rParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
            addView(mSearchBar, rParams);
            
            getOverlayView().setTorchButtonMarginsAndSize(15, 55, 40, 40);
            getOverlayView().setCameraSwitchButtonMarginsAndSize(15, 55, 40, 40);
            
            
            requestChildFocus(null, null);
        } else if (!show && mSearchBar != null) {
            removeView(mSearchBar);
            mSearchBar = null;
            invalidate();
        }
    }

    protected void setSearchBarPlaceholderText(String text) {
        mSearchBar.setHint(text);
    }

    private void onSearchClicked() {
        mListener.didEnter(mSearchBar.getText());
    }


    public interface ScanditSDKSearchBarListener {
        /**
         *  Called whenever a string was entered in the search bar and the button to search was pressed.
         *
         *  @param entry the text that has been entered by the user.
         */
        void didEnter(String entry);
    }
}
