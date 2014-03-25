define(function(require, exports, module) {
        //includes Famous
        var Engine = require("famous/Engine");
        var Modifier = require("famous/Modifier");
        var Transform = require("famous/Transform");
        var GameView        = require("app/views/Game");
        var Timer   = require("famous-utilities/Timer")


       
        var modifier = new Modifier({
            origin: [.5,.5],
            size: [640, 960]
        });

        var appDims = getAppDims();
        var contextContainer = document.getElementById("contextContainer");
        _resize();

        //create the new one
        var context = Engine.createContext(contextContainer);
        

        modifier.setTransform(Transform.scale(appDims[2], appDims[2], 1));
        var game = new GameView();

        context.add(modifier).add(game);
        Engine.on("resize", _resize);


        function _resize(){
            var appDims = getAppDims();
            var contextContainer = document.getElementById("contextContainer");
            contextContainer.style.width = appDims[0] + "px";
            contextContainer.style.height = appDims[1] + "px";

             modifier.setTransform(Transform.scale(appDims[2], appDims[2], 1));
        }

        function getAppDims(){
            var scaleY = window.innerHeight / 960;
            var scaleX = window.innerWidth / 640;
            var scale = Math.min(scaleX, scaleY);

            var appWidth = 640 * scale;
            var appHeight = 960 * scale;

            return [appWidth, appHeight, scale];
        }
});

