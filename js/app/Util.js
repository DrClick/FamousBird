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
    }//end function
    

    module.exports = Utils;
});
