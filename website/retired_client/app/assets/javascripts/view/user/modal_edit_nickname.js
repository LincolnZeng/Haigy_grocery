modulejs.define("view/user/modal_edit_nickname", [
  "jst",
  "app/constant",
  "view/user/modal_edit_base_class"
], function(JST, constant, userModaleditbaseclassViewDef) {
  "use strict";


  var userModaleditnicknameView = userModaleditbaseclassViewDef.extend({
    template: JST["template/user/modal_edit_nickname"],


    templateParameters: function(userAttributes) {
      return {nickname: userAttributes.nickname};
    },


    formFieldsSetting: function() {
      return {
        nickname: constant.semanticUi.validateRule.NICKNAME
      };
    },


    generateUserAttributes: function(formData) {
      return {
        id: this.userId,
        nickname: formData.nickname
      };
    }
  });


  return userModaleditnicknameView;
});
