modulejs.define("state/action", function() {
  "use strict";


  var action = {
    // type definitions
    RENDER_PAGE: "RENDER_PAGE",
    SET_USER_ATTRIBUTES: "SET_USER_ATTRIBUTES",
    SET_SESSION_IS_UP_TO_DATE: "SET_SESSION_IS_UP_TO_DATE",


    // actions
    renderPage(pageMainComponent, pageOptions) {
      return {type: this.RENDER_PAGE, pageMainComponent, pageOptions};
    },


    setUserAttributes(userProfile) {
      return {
        type: this.SET_USER_ATTRIBUTES,
        userAttributes: {
          userId: userProfile.userId,
          isTemporary: userProfile.isTemporary,
          nickname: userProfile.nickname,
          email: userProfile.email,
          phone: userProfile.phone,
          deliveryZipCode: userProfile.deliveryZipCode,
          shoppingZipCode: userProfile.shoppingZipCode,
          address: userProfile.address
        }
      };
    },


    setSessionIsUpToDate(sessionIsUpToDate) {
      return {type: this.SET_SESSION_IS_UP_TO_DATE, sessionIsUpToDate};
    }
  };


  return action;
});