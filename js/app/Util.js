define(function(require, exports, module) {
    var Text = require('Text');
    var Hogan = require('lib/Hogan');
    var Matrix = require('famous/Matrix');

    /**
     * @class Collection of various utility functions
     */
     var Utils = {                
        playSound: function(sound){
            setTimeout(function(){
                sound.currentTime = 0.01;
                if (sound.Play) {
                    sound.Play();
                } else if (sound.play) {
                    sound.play();
                }

            },1);
        },//end function

        pulse: function(modifier){
            var m = modifier;
            m.setTransform(
                Matrix.scale(1.05,1.05, 1), { duration: 300 }, 
                function(){
                    m.setTransform(Matrix.scale(1,1, 1), { duration: 100 });
                });
        },//end function

        loadFragment: function(fragment, data, callback){
             require(['text!' + fragment], function(frag){
                var result = Hogan.compile(frag).render(data);
                callback(result);
            });
        }//end function
    };

    module.exports = Utils;
});
