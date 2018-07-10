// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.


//= require jquery/2.1.4/jquery-2.1.4.min
//= require underscore/1.8.3/underscore-min
//= require backbone/1.2.1/backbone-min
//= require modulejs/1.9.0/modulejs-1.9.0.min

//= require app_lib/semantic_ui
//= require app_lib/browserified_lib

//= require 1.1.0/alerter
//= require 1.1.0/backbone_cache
//= require 1.1.0/cached_request
//= require 1.1.0/confirmer
//= require 1.0.0/easy_form
//= require 1.1.0/key_value_cache
//= require 1.1.0/local_storage_cache
//= require 1.1.0/multipart_form_ajax
//= require 1.0.0/validator

//= require app_lib/all_other_lib_wrapper

//= require_tree .


var starter = modulejs.require("app/starter");
starter.run();