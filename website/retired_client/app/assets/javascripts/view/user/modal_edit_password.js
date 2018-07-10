modulejs.define("view/user/modal_edit_password", [
  "jst",
  "app/constant",
  "view/user/modal_edit_base_class"
], function(JST, constant, userModaleditbaseclassViewDef) {
  "use strict";


  var userModaleditpasswordView = userModaleditbaseclassViewDef.extend({
    template: JST["template/user/modal_edit_password"],


    templateParameters: function() {
      return {};
    },


    formFieldsSetting: function() {
      var validateRule = constant.semanticUi.validateRule;
      return {
        new_password: validateRule.PASSWORD,
        repeat_new_password: {rules: [{type: "match[new_password]", prompt: "The repeated new password does not match the new password."}]},
        current_password: validateRule.PASSWORD
      };
    },


    generateUserAttributes: function(formData) {
      return {
        id: this.userId,
        new_password: formData.new_password,
        password: formData.current_password
      };
    }
  });


  return userModaleditpasswordView;
});
