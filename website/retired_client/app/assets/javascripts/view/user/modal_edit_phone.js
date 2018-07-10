modulejs.define("view/user/modal_edit_phone", [
  "jst",
  "app/constant",
  "view/user/modal_edit_base_class"
], function(JST, constant, userModaleditbaseclassViewDef) {
  "use strict";


  var userModaleditphoneView = userModaleditbaseclassViewDef.extend({
    template: JST["template/user/modal_edit_phone"],


    templateParameters: function(userAttributes) {
      return {phone: userAttributes.phone};
    },


    formFieldsSetting: function() {
      return {
        phone: constant.semanticUi.validateRule.PHONE_OPTIONAL
      };
    },


    generateUserAttributes: function(formData) {
      return {
        id: this.userId,
        phone: formData.phone
      };
    }
  });


  return userModaleditphoneView;
});
