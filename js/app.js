define(function(require, exports, module) {
        //includes Famous
        var Engine = require("famous/Engine");
        var Modifier = require("famous/Modifier");
        var Transform = require("famous/Transform");
        var GameView        = require("app/views/Game");

        //create the new one
        var context = Engine.createContext();
        var game = new GameView();


        //scale the window
        var scaleX = window.innerHeight / 960;
        var scaleY = window.innerWidth / 640;
        var scale = Math.min(scaleX, scaleY);
        


        context.add(new Modifier({
           origin : [.5,.5],
           transform: Transform.scale(scale,scale,1)
        })).add(game);
        //That was easy!!!

});

