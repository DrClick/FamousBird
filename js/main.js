define(function(require, exports, module) {

    function main(){
        //includes Famous
        var Engine = require('famous/Engine');
        var ContainerSurface = require('famous/ContainerSurface');
        var Modifier = require("famous/Modifier");
        var Matrix = require("famous/Matrix");
     
        //includes Physics
        var PhysicsEngine = require('famous-physics/PhysicsEngine');
        
        //Game Elements
        var Game = require('app/Game');

        //remove any exisitng context
        var contextChildren = document.getElementsByClassName("famous-container");
        for (var i = 0; i < contextChildren.length; i++) {
            contextChildren[i].parentNode.removeChild(contextChildren[i]);
        };
        //create the new one
        var mainCtx = Engine.createContext();

        //initiate the physics engine
        var physicsEngine = new PhysicsEngine({numConstraints : 4});

        var game = new Game(physicsEngine);
    
        game.init();

        Engine.on('click', function(){game.handleClicks();});
        Engine.on('touchstart', function(){game.handleClicks();});
        Engine.on('keydown', function(){game.handleClicks();});

        game.on('restart', main);

        var scaleX = window.innerHeight / 960;
        var scaleY = window.innerWidth / 640;
        var scale = Math.min(scaleX, scaleY);
        mainCtx.add(new Modifier({
            origin : [.5,.5],
            transform: Matrix.scale(scale,scale,1)
        })).add(game);

    };

    main();

});

