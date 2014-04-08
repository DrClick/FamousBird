define(function(require, exports, module) {
    "use strict";
    var Transform = require('famous/core/Transform');

    /**
     * @class Collection of various utility functions
     */
    var Utils = {};

    Utils.pulse = function(modifier){
        var m = modifier;
        var initTransform = m.getFinalTransform();

        //scale up the transform and return it to normal
        m.setTransform(
            Transform.multiply(m.getFinalTransform(), Transform.scale(1.2,1.2,1)),
            { duration: 100 },
            function(){
                m.setTransform(initTransform, { duration: 100 });
            });
    };//end function

    Utils.isMobile = function() { 
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    };//end function
    
    Utils.get = function(url, success, failure){
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function() {
          // This is called even on 404 etc
          // so check the status
          if (req.status == 200) {
            success(req.response);
          }
          else {
            failure(Error(req.statusText));
          }
        };

        // Handle network errors
        req.onerror = function() {
          failure(Error("Network Error"));
        };

        // Make the request
        req.send();
    };//end function


    module.exports = Utils;
});
