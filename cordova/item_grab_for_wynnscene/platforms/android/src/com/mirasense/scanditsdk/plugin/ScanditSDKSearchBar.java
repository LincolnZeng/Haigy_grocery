package com.mirasense.scanditsdk.plugin;

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.Editable;
import android.text.InputType;
import android.text.TextUtils.TruncateAt;
import android.text.TextWatcher;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.RelativeLayout;
import com.scandit.base.geometry.SbRectangle;
import com.scandit.base.system.SbResourceUtils;
import com.scandit.base.view.SbImageButton;

/**
 * Layout containing the search bar.
 * 
 * @author Moritz Hartmeier
 */
@SuppressLint("ViewConstructor")
public class ScanditSDKSearchBar extends RelativeLayout {
    
    private final static String STATE_SEARCH_NORMAL = "normal";

	private EditText mSearchEditText;
	private SbImageButton mSearchButton;
	private OnClickListener mOnClickListener = null;
	
	
	public ScanditSDKSearchBar(Context context) {
		this(context, null);
	}
	
	public ScanditSDKSearchBar(Context context, OnClickListener listener) {
		super(context);

		mOnClickListener = listener;
		
        RelativeLayout.LayoutParams rParams;
        
        mSearchButton = new SbImageButton(getContext(), new SbRectangle(0, 0, 0, 0));
        mSearchButton.setResourceIdForState(STATE_SEARCH_NORMAL, 
                SbResourceUtils.getResIdentifier(context, "ic_btn_search", "raw"));
        mSearchButton.setState(STATE_SEARCH_NORMAL);
        rParams = new RelativeLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT);
        rParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
        addView(mSearchButton, rParams);
        mSearchButton.setId(1234);
        mSearchButton.setOnClickListener(new OnClickListener() {
        	@Override
        	public void onClick(View v) {
        		onButtonClicked();
        	}
        });
        
        mSearchEditText = new EditText(getContext());
        mSearchEditText.setLines(1);
        mSearchEditText.setEllipsize(TruncateAt.END);
        mSearchEditText.setInputType(InputType.TYPE_CLASS_NUMBER);
        rParams = new RelativeLayout.LayoutParams(
                LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        rParams.addRule(RelativeLayout.ALIGN_PARENT_LEFT);
        rParams.addRule(RelativeLayout.LEFT_OF, mSearchButton.getId());
        addView(mSearchEditText, rParams);
        mSearchEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void afterTextChanged(Editable s) {
                RelativeLayout.LayoutParams params = 
                    (RelativeLayout.LayoutParams) mSearchButton.getLayoutParams();
                if (s.length() > 0) {
                    params.width = mSearchEditText.getHeight();
                    params.height = mSearchEditText.getHeight();
                    mSearchButton.setLayoutParams(params);
                } else {
                    params.width = 0;
                    mSearchButton.setLayoutParams(params);
                }
            }
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count,
                    int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before,
                    int count) {}
        });
        mSearchEditText.setOnKeyListener(new OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                if (event.getKeyCode() == KeyEvent.KEYCODE_ENTER
                            && event.getAction() == KeyEvent.ACTION_UP) {
                	onButtonClicked();
                    return true;
                }
                return false;
            }
        });
	}
	
	private void onButtonClicked() {
        InputMethodManager imm = 
            (InputMethodManager) getContext().getSystemService(
                    Context.INPUT_METHOD_SERVICE);
        imm.hideSoftInputFromWindow(
                mSearchEditText.getApplicationWindowToken(), 0);
        
        if (mOnClickListener != null) {
        	mOnClickListener.onClick(mSearchButton);
        }
	}
	
	public void setHint(String hint) {
        mSearchEditText.setHint(hint);
	}
	
	public void setInputType(int inputType) {
        mSearchEditText.setInputType(inputType);
	}
	
	public String getText() {
		return mSearchEditText.getText().toString();
	}
    public void clear() {
        mSearchEditText.setText("");
    }
}
