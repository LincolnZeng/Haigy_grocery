modulejs.define("view/user/modal_edit_email", [
  "jst",
  "app/constant",
  "view/user/modal_edit_base_class"
], function(JST, constant, userModaleditbaseclassViewDef) {
  "use strict";


  var userModaleditemailView = userModaleditbaseclassViewDef.extend({
    template: JST["template/user/modal_edit_email"],


    templateParameters: function(userAttributes) {
      return {email: userAttributes.email};
    },


    formFieldsSetting: function() {
      var validateRule = constant.semanticUi.validateRule;
      return {
        email: validateRule.EMAIL,
        password: validateRule.PASSWORD
      };
    },


    generateUserAttributes: function(formData) {
      return {
        id: this.userId,
        email: formData.email,
        password: formData.password
      };
    }
  });


  return userModaleditemailView;
});
