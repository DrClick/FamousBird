define(function(require, exports, module) {
        //includes Famous
        var Engine = require("famous/Engine");
        var Modifier = require("famous/Modifier");
        var Transform = require("famous/Transform");
        //var Resume = require("app/views/Resume");
        var GameView        = require("app/views/Game");

        //create the new one
        var context = Engine.createContext();
        context.setPerspective(10000);

        var game = new GameView();
        

         //scale the window
        var scaleY = window.innerHeight / 960;
        var scaleX = window.innerWidth / 640;
        var scale = Math.min(scaleX, scaleY);

        var newSize = [640 * scale, 960 * scale];
        var offsetX = (640 - newSize[0])*0.25;

        var offsetMatrix = Transform.move(
            Transform.scale(scale, scale,1),
            [offsetX, 0]
        );

        context.add(new Modifier({
            origin: [0,0],
            size: [window.innerWidth, window.innerHeight],
            transform: offsetMatrix
        })).add(game);

});

