define(function(require, exports, module) {
	"use strict";
    var SoundPlayer = require('app/audio/SoundPlayer');

    var _soundPlayer = null;

    function _loadGameSounds(callback){
        if (!_soundPlayer){
          _soundPlayer = new SoundPlayer([
             'content/sounds/flap.wav',
             'content/sounds/die.wav',
             'content/sounds/score.wav',
             'content/sounds/fire.wav'
          ], function (e) { 
            callback();
          });
        }
        return _soundPlayer;
    }
    

    module.exports = _loadGameSounds;
});
