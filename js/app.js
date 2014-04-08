define(function(require, exports, module) {
    "use strict";
    //includes Famous
    var Engine      = require("famous/core/Engine");
    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    

    var GameView    = require("app/views/Game");
    var AssetLoader = require("app/AssetLoader");
    var Loading     = require("app/views/Loading");

    
    var context = null;

    var modifier = new Modifier({
        origin: [.5,.5],
        size: [640, 960]
    });

    function getAppDims(){
        var scaleY = window.innerHeight / 960;
        var scaleX = window.innerWidth / 640;


        //here we are going to let the bottom of the screen be cut off to allow fit to more
        //devices
        var scale = Math.min(scaleX, scaleY * 1.2);
        //var scale = 1;

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
        //DV: i would do this in CSS, and not call _resize on contextContainer
        _resize(contextContainer);

        //create the new one
        context = Engine.createContext(contextContainer);
        context.setPerspective(3000);

        Engine.on("resize", function(){_resize(contextContainer);});
        Engine.on("orientationchange", function(){_resize(contextContainer);});
    }

    function _loadGame(){
        var game = new GameView();
        context.add(modifier).add(game);
    }

    _init();


    var requiredAssets = [
        "content/font/04B_19__.TTF",
        "content/font/terminal.woff",
        "content/images/birdie_1.png",
        "content/images/birdie_2.png",
        "content/images/birdie_3.png",
        "content/images/pipe.png",
        "content/images/pipe_up.png",
        "content/images/floor.png",
        "content/images/grass.png",
        "content/images/plant_lower.png",
        "content/images/plant_upper.png",
        "content/images/ready.png"
    ];

    var loading = new Loading();
    loading.show();
    context.add(loading);

    AssetLoader.on("asset.loaded", function(data){
        loading.setProgress(data.complete);
    });

    AssetLoader.getAssets(requiredAssets, function(){
        
        loading.hide();
        _loadGame.call(this);
    }.bind(this));


});

