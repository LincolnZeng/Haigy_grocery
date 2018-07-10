modulejs.define("state/store", [
  "redux",
  "state/reducer"
], function(Redux, reducer) {
  "use strict";


  var stateStore = Redux.createStore(reducer);


  return stateStore;
});