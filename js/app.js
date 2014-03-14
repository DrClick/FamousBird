define(function(require, exports, module) {
        //includes Famous
        var Engine = require("famous/Engine");
        var Modifier = require("famous/Modifier");
        var Transform = require("famous/Transform");
        var GameView        = require("app/views/Game");

         //scale the window
        var scaleY = window.innerHeight / 960;
        var scaleX = window.innerWidth / 640;
        var scale = Math.min(scaleX, scaleY);

        console.log(scale);

        var appWidth = 640 * scale;
        var appHeight = 960 * scale;

        var contextContainer = document.getElementById("contextContainer");
        contextContainer.style.width = appWidth + "px";
        contextContainer.style.height = appHeight + "px";

        //create the new one
        var context = Engine.createContext(contextContainer);


        var game = new GameView();

        context.add(new Modifier({
            origin: [.5,.5],
            size: [640, 960],
            transform: Transform.scale(scale, scale, 1)
        })).add(game);
});

