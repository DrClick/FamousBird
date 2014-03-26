define(function(require, exports, module) {
    "use strict";
    var Transform = require('famous/core/Transform');

    /**
     * @class Collection of various utility functions
     */
     var Utils = {                
        playSound: function(sound){
            //setTimeout(function(){
                sound.currentTime = 0.01;
                if (sound.Play) {
                    sound.Play();
                } else if (sound.play) {
                    sound.play();
                }

            //},1);
        },//end function

        pulse: function(modifier){
            var m = modifier;
            m.setTransform(
                Transform.scale(1.05,1.05, 1), { duration: 300 }, 
                function(){
                    m.setTransform(Transform.scale(1,1, 1), { duration: 100 });
                });
        }//end function
    };

    module.exports = Utils;
});
