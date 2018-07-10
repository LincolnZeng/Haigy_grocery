modulejs.define("haigy/lib/1.0.0/multipart_form_ajax", ["underscore", "jquery"], function(_, $) {
  "use strict";


  var multipartFormAjax = {
    submit: function(method, url, formData, options) {
      // ------ options may look like: ------
      // options = {
      //   progress: function(event) {},
      //   beforeSend: function(jqXHR, settings) {},
      //   success: function(data, textStatus, jqXHR) {},
      //   error: function(jqXHR, textStatus, errorThrown) {},
      //   complete: function(jqXHR, textStatus ) {}
      // };
      // ------------

      if (!options) {
        options = {};
      }

      var progressCallback = options.progress || function() {};

      $.ajax(_.extend({
        url: url,  //Server script to process data
        type: method,
        dataType: "json",
        xhr: function() {  // Custom XMLHttpRequest
          var customizedXhr = $.ajaxSettings.xhr();
          if(customizedXhr.upload){ // Check if upload property exists
            customizedXhr.upload.addEventListener("progress", progressCallback, false); // For handling the progress of the upload
          }
          return customizedXhr;
        },
        // Form data
        data: formData,
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
      }, options));
    }
  };


  return multipartFormAjax;
});
