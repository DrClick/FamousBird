define(function(require, exports, module) {
    var SoundPlayer = require('famous-audio/SoundPlayer');


    var soundPlayer = new SoundPlayer([
       'content/sounds/flap.wav',
       'content/sounds/die.wav',
       'content/sounds/score.wav'
    ], function (e) { 
        console.log('sounds loaded', e);
    });

    module.exports = soundPlayer;
});
