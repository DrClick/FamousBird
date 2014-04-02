define(function(require, exports, module) {
        "use strict";
        //includes Famous
        var Engine      = require("famous/core/Engine");
        var Modifier    = require("famous/core/Modifier");
        var Transform   = require("famous/core/Transform");
        var GameView    = require("app/views/Game");

       
        var modifier = new Modifier({
                origin: [.5,.5],
                size: [640, 960]
            });

        function getAppDims(){
            var scaleY = window.innerHeight / 960;
            var scaleX = window.innerWidth / 640;
            var scale = Math.min(scaleX, scaleY);

            var appWidth = 640 * scale;
            var appHeight = 960 * scale;

            return [appWidth, appHeight, scale];
        }

        function _resize(container){
            var appDims = getAppDims();
            container.style.width = appDims[0] + "px";
            container.style.height = appDims[1] + "px";

            modifier.setTransform(Transform.scale(appDims[2], appDims[2], 1));
        }

        function _init(){
            var contextContainer = document.getElementById("contextContainer");
            _resize(contextContainer);

            //create the new one
            var context = Engine.createContext(contextContainer);
            context.setPerspective(3000);
            

            var game = new GameView();
            context.add(modifier).add(game);

            Engine.on("resize", function(){_resize(contextContainer);});
            window.addEventListener("orientationchange", function(){_resize(contextContainer);});
        }

        _init();
});

