define(function(require, exports, module) {
    
    //one place to load sounds
    var resources = [
        {sound:"flap", location: "flap.wav"},
        {sound:"die", location: "die.wav"},
        {sound:"score", location: "score.wav"}
    ];
    var sounds = {};



    for (var i = resources.length - 1; i >= 0; i--) {
        var res = resources[i];
        var el = document.createElement("audio");
        el.setAttribute("controls", true);
        var src = document.createElement("source");
        src.src = "../../content/sounds/" + res.location;
        el.appendChild(src);
        sounds[res.sound] = el;
    };

    module.exports = sounds;
});
