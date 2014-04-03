define(function(require, exports, module) {
	"use strict";
    var SoundPlayer = require('app/audio/SoundPlayer');


    var soundPlayer = new SoundPlayer([
       'content/sounds/flap.wav',
       'content/sounds/die.wav',
       'content/sounds/score.wav'
    ], function (e) { 
        //console.log('sounds loaded', e);
    });

    module.exports = soundPlayer;
});
