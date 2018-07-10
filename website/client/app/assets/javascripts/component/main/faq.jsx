modulejs.define("component/main/faq", [
  "react",
  "app/analytics",
  "app/navigator"
], function(React, analytics, navigator) {
  "use strict";


  var MainFaqComponent = React.createClass({
    render() {
      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-800px haigy-text-align-left">
            <h2><i>Frequently Asked Questions</i></h2>

            <br />

            <div className="haigy-padding-l-30px">
              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">1. </span>What's Haigy?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Haigy is a grocery delivery company. Haigy wishes to provide you an easier way to buy groceries, to make the grocery shopping no longer a burden to you. Haigy wishes this convenience may help you eat fresher and healthier.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">2. </span>What makes Haigy different?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Haigy cares more about you. For encouraging you to eat fresher and healthier, Haigy persist in the low delivery fee and no minimum order amount to help you buy groceries more often. For accommodating your own preferences, Haigy provides a customized ordering system, which allows you to buy almost any groceries from local stores without any extra cost. For making the website easier for you to use, Haigy even cares about the ordering of items you browsed.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">3. </span>What is the customized ordering system for?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                First, it provides you a way to buy almost any groceries from local stores, even those are not listed on Haigy's website. Second and also more importantly, it provides you a convenient and casual way to buy groceries. “Hi Haigy, can I get 7 fuji apples?” When you were busy or already knew what you want, using this kind of message to order groceries seems easier and more efficient. Also, if you have ever asked your wife or husband to buy groceries, this scenario looks familiar, right? Let Haigy to be your grocery assistant! <a href={navigator.mainHowhaigyworksHash}>Click here to learn more about the customized ordering?</a>
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">4. </span>Can I buy groceries from multiple stores in one customized order? Is there any extra cost?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                We are happy to buy you groceries from multiple stores. Bringing you as much convenience as we can is our goal. There is no any extra cost for you. Enjoy!
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">5. </span>Can I use a photo to tell you what I need when I place a customized order?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Yes, Haigy accepts all kinds of media in a customized order, such as voice messages, images, videos, and more.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">6. </span>Does the customized ordering system support languages other than English?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Haigy currently only supports English. However, Haigy has a plan to support more languages in the future.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">7. </span>Is there any extra cost for a customized order?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Not at all.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">8. </span>How much does Haigy’s service cost?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Haigy only charges $2.99 per delivery, and does not have any hidden fees or price markups.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">9. </span>Do I need to pay tips to Haigy?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Not at all. Haigy does not have any hidden fees.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">10. </span>Is there any price markups of groceries that Haigy buy from local stores?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                No, there is no price markups. We update grocery prices according to the real time store prices as often as we could.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">11. </span>Is there any minimum order amount?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                No, there is no minimum order amount.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">12. </span>Can Haigy make the same day delivery?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Haigy currently provides next day delivery. However, Haigy understands there might be special circumstances. If there is, please let us know, and we will try our best to accommodate.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">13. </span>What areas does Haigy serve?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Haigy currently serves four cities in the San Francisco East Bay Area. Those are Emeryville, Berkeley, Albany, and El Cerrito. However, Haigy grows fast and will extend to more areas soon.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">14. </span>Where does Haigy buy my groceries from?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Haigy has its own grocery inventory. However, if there is anything you order that we do not have, we will buy it from local stores, such as Whole Food Markets, Target, Safeway, Costco, etc.
              </div>
              <br />

              <div className="haigy-font-bold haigy-font-italic"><span className="haigy-font-size-200">15. </span>Can I return an item that Haigy buys for me?</div>
              <div className="haigy-padding-l-30px haigy-padding-t-5px haigy-padding-b-10px">
                Haigy is currently testing the Produce Stress-Free program. This program allows you to exchange or get refund for any produce that we purchase for you. However, other grocery items are refundable only if Haigy makes a mistake.
              </div>
              <br />
            </div>

            <br /><br />

            <div className="haigy-text-align-center">
              <div><a href={navigator.mainHomeHash}><i>Back to the Home Page</i></a></div>
            </div>
          </div>
        </div>
      );
    },


    componentWillMount() {
      analytics.faqPageVisited();
    }
  });


  return MainFaqComponent;
});