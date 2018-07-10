modulejs.define("component/main/how_haigy_works", [
  "react",
  "app/precompiled_asset",
  "app/analytics",
  "app/navigator"
], function(React, precompiledAsset, analytics, navigator) {
  "use strict";


  var MainHowhaigyworksComponent = React.createClass({
    render() {
      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-800px haigy-text-align-left">
            <h2><i>Cannot find your desired grocery items?</i></h2>
            <div><i>
              <div>You may try Haigy's customized order. There is no extra cost for it.</div>
              <br />
              <div>Haigy's customized order provides you a way to buy almost any groceries from local stores.</div>
              <br />
              <div>More importantly, Haigy's customized order provides you a convenient and casual way to buy groceries. “Hi Haigy, can I get 7 fuji apples?” When you were busy or already knew what you want, using this kind of message to order groceries seems easier and more efficient. If you have ever asked your wife or husband to buy groceries, this scenario looks familiar, right? Let Haigy to be your grocery assistant!</div>
            </i></div>
            <br /><br />

            <h2><i>How to place a customized order?</i></h2>
            <br />

            <div className="haigy-width-100-percent haigy-text-align-center">
              <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-500px">
                <div className="haigy-video-youtube haigy-image-loading-background">
                  <iframe src="https://www.youtube.com/embed/Qk_6fPnSziA" frameBorder="0" allowFullScreen="allowFullScreen"></iframe>
                </div>
              </div>
            </div>
            <br /><br />

            <div className="haigy-font-italic"><span className="haigy-font-size-135">Step 1. </span>Send your customized grocery shopping request to Haigy. You may send it through an email to the email address <a href="mailto:request@haigy.com">request@haigy.com</a>, or send it through a text message to the phone number <a href="tel:+15108598197">(510) 859-8197</a>, or send it through our online <a href={navigator.mainCustomizedorderformHash}>customized order form</a>.</div>
            <br />
            <div className="haigy-width-100-percent haigy-text-align-center haigy-image-loading-background haigy-height-200px">
              <img className="haigy-height-100-percent" src={precompiledAsset.image.HOW_HAIGY_WORKS_STEP_1} alt="How to place a customized order? Step 1" />
            </div>
            <br /><br />

            <div className="haigy-font-italic"><span className="haigy-font-size-135">Step 2. </span>Haigy will pick items for you first, and let you verify, make adjustments if necessary, and checkout.</div>
            <br />
            <div className="haigy-width-100-percent haigy-text-align-center haigy-image-loading-background haigy-height-400px">
              <img className="haigy-height-100-percent" src={precompiledAsset.image.HOW_HAIGY_WORKS_STEP_2} alt="How to place a customized order? Step 2" />
            </div>
            <br /><br />

            <div className="haigy-font-italic"><span className="haigy-font-size-135">Step 3. </span>Receive your groceries at your door.</div>
            <br />
            <div className="haigy-width-100-percent haigy-text-align-center haigy-image-loading-background haigy-height-150px">
              <img className="haigy-height-100-percent" src={precompiledAsset.image.HOW_HAIGY_WORKS_STEP_3} alt="How to place a customized order? Step 3" />
            </div>
            <br /><br />

            <h2><i>How does Haigy pick items for my customized order?</i></h2>

            <br />

            <div className="haigy-padding-l-30px">
              <div className="haigy-font-italic">
                <span className="haigy-font-size-135">1. </span>
                If you have a clear description of the item in your request, Haigy will pick the right one for you.
              </div>
              <br />

              <div className="haigy-font-italic">
                <span className="haigy-font-size-135">2. </span>
                If you only send Haigy a vague description, but you have used Haigy before, Haigy will try to pick it according to your purchase history and your preference. Haigy gets to know your preferences over time.
              </div>
              <br />

              <div className="haigy-font-italic">
                <span className="haigy-font-size-135">3. </span>
                If Haigy still doesn't have enough clues to pick the item for you, Haigy will try to get the most popular one in the same category.
              </div>
              <br />

              <div className="haigy-font-italic">
                <span className="haigy-font-size-135">4. </span>
                Haigy always provides substitutes for each item so that you may make adjustments if Haigy doesn't choose the right one in the first place.
              </div>
              <br />
            </div>

            <br /><br /><br />

            <div className="haigy-text-align-center">
              <div><a href={navigator.mainFaqHash}>See Frequently Asked Questions</a></div>
              <br />
              <div><a href={navigator.mainHomeHash}><i>Back to the Home Page</i></a></div>
            </div>
          </div>
        </div>
      );
    },


    componentWillMount() {
      analytics.howhaigyworksPageVisited();
    }
  });


  return MainHowhaigyworksComponent;
});