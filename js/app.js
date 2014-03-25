define(function(require, exports, module) {
        //includes Famous
        var Engine = require("famous/Engine");
        var Modifier = require("famous/Modifier");
        var Transform = require("famous/Transform");
        var GameView        = require("app/views/Game");

        var contextContainer = document.getElementById("contextContainer");
        contextContainer.style.width = "640px";
        contextContainer.style.height = "960px";

        //create the new one
        var context = Engine.createContext(contextContainer);
        var modifier = new Modifier({
            origin: [.5,.5],
            size: [640, 960]
        });

        var game = new GameView();

        context.add(modifier).add(game);

        _resize();
        Engine.on("resize", _resize);


        function _resize(){
             //scale the window
            var scaleY = window.innerHeight / 960;
            var scaleX = window.innerWidth / 640;
            var scale = Math.min(scaleX, scaleY);

            var appWidth = 640 * scale;
            var appHeight = 960 * scale;

            var contextContainer = document.getElementById("contextContainer");
            contextContainer.style.width = appWidth + "px";
            contextContainer.style.height = appHeight + "px";

            modifier.setTransform(Transform.scale(scale, scale, 1));
        }
});

