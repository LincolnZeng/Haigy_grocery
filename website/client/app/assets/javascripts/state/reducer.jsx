modulejs.define("state/reducer", [
  "underscore",
  "react",
  "app/cookie",
  "state/action"
], function(_, React, cookie, stateAction) {
  "use strict";


  const initialState = {
    currentPageMainComponent: () => <div />,
    currentPageOptions: {},
    userAttributes: {
      userId: cookie.user.getUserId(),
      isTemporary: cookie.user.getIsTemporary(),
      nickname: cookie.user.getNickname(),
      email: cookie.user.getEmail(),
      phone: cookie.user.getPhone(),
      deliveryZipCode: cookie.user.getDeliveryZipCode(),
      shoppingZipCode: cookie.user.getShoppingZipCode(),
      address: cookie.user.getAddress()
    },
    sessionIsUpToDate: false
  };


  // return newState
  var reducer = function(previousState = initialState, currentAction) {
    switch (currentAction.type) {
    case stateAction.RENDER_PAGE:
      return _.assign({}, previousState, {
        currentPageMainComponent: currentAction.pageMainComponent,
        currentPageOptions: currentAction.pageOptions
      });
    case stateAction.SET_USER_ATTRIBUTES:
      return _.assign({}, previousState, {
        userAttributes: currentAction.userAttributes
      });
    case stateAction.SET_SESSION_IS_UP_TO_DATE:
      return _.assign({}, previousState, {
        sessionIsUpToDate: currentAction.sessionIsUpToDate
      });
    default:
      return previousState;
    }
  };


  return reducer;
});