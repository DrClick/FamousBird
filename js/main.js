define(function(require, exports, module) {

    //includes Famous
    var Engine = require('famous/Engine');
    var Surface = require('famous/Surface');
    var ContainerSurface = require('famous/ContainerSurface');
    var RenderNode = require('famous/RenderNode');
    var Modifier = require('famous/Modifier');
    var Matrix = require('famous/Matrix');
    var Timer = require('famous-utils/Time');
    //var FastClick = require('famous-sync/FastClick'); //WTF it crashes things

    //includes Physics
    var PhysicsEngine = require('famous-physics/PhysicsEngine');
    var Random = require('famous-physics/math/random');

    //include forces and constraints
    var VectorField = require('famous-physics/forces/VectorField');
    var Overlap = require('app/Overlap');
    var Wall = require("famous-physics/constraints/Wall");
    
    //Game Elements
    var Birdie = require('app/Bird');
    var Cloud = require('app/Cloud');
    var Pipe = require('app/Pipe');
    var Floor = require('app/Floor');
    var Score = require('app/Score');
    var Sounds = require('app/Sounds');

    //Widgets
    var BouncyPane = require('app/widgets/BouncyPane');
    var ButtonPane = require('app/widgets/ButtonPane');
    var SlideUpPane = require('app/widgets/SlideUpPane');

    //Utils
    var AppUtils = require('app/Util');
    var Sounds = require('app/Sounds');

    //Transitions
    var Transitionable = require('famous/Transitionable');
    var SpringTransition = require('famous-physics/utils/SpringTransition')


    Transitionable.registerMethod('spring', SpringTransition);

    //main context
    var mainCtx = Engine.createContext();

    //-----------------------------------------------BEGIN APP


    var 
        birdie          = null,
        wallRestitution = 0,
        gravityStrength = 0.002,
        wallSize        = [640,960],
        game            = {started:false, over: false, scorer: null, score : 0},
        timers          = {clouds:null, pipes:null, floor: null, clean: null},
        pipeCounter     = 1,
        panes           = {welcome: null, gameOver: null, welcomeButtons: null, finalScore: null, gameOverButtons: null};

    //initiate the physics engine
    var PE = new PhysicsEngine({numConstraints : 4});


    //create the birdie, this makes it the first child node.
    birdie = new Birdie({physicsEngine:PE});


    //create the container and link the physics engine
    var mainSurface = new ContainerSurface({
        size : wallSize,
        properties: {
            border : '1px solid white',
            pointerEvents : 'none'
        },
        classes: ['game']
    });

    var mainModifier = new Modifier(Matrix.identity);
    mainSurface.link(PE);
    

    //this node will be used to append widgets and everything else basically
    var mainRenderNode = new RenderNode();
    mainRenderNode.add(mainModifier).link(mainSurface);

    
    //create gravity
    var gravity = new VectorField({name : VectorField.FIELDS.CONSTANT, strength : gravityStrength})
    var initFloor = new Floor({initPos:300});
    initFloor.attachToPhysics(PE);


    //The following spawn the game elements

    var spawnClouds = function(){
        if(!game.ended){
            var cloud = new Cloud();
            cloud.attachToPhysics(PE);
        }//end if game not ended
    };

    var spawnPipes = function(){
        if(!game.ended){
            var pipe = new Pipe({id:pipeCounter});
            var pipeParticles = pipe.attachToPhysics(PE);

            pipeCounter++;//increment pipe

            var overlap = new Overlap();
            overlap.on("hit", endGame);
            PE.attach(overlap, pipeParticles, birdie.particle);

            var overlapScore = new Overlap();
            overlapScore.on("hit", score);
            PE.attach(overlapScore, pipeParticles[0], game.scorer.particle);
        }//end if game not over
    };

    var spawnFloor = function(){
        if(!game.ended){
            var floor = new Floor();
            var floorParticle = floor.attachToPhysics(PE);
        }//end if not game over
    }

    var cleanupObjects = function(){
        var numParticles = PE._particles.length;
        PE._particles.splice(1,numParticles-100);
    }
    
    var spawnGame = function(){
        //Spawn the scene
        timers.clouds = Timer.setInterval(spawnClouds,1000);
        timers.floor = Timer.setInterval(spawnFloor,2000);
        timers.clean = Timer.setInterval(cleanupObjects, 2000);

    };





    //Game Functions ----------------------------------------
    var stopTheWorld = function(){
        for (var i = 1; i < PE._particles.length; i++) {
            PE._particles[i].v.x = 0;
        };
    }
    
    var showWelcomeScreen = function(){
        panes.welcome = new BouncyPane(PE, {
            content: '<h1>Famous Bird</h1>',
            classes: ['startup']
        })
        panes.welcome.show();

        panes.welcomeButtons = new ButtonPane(mainRenderNode, {
            buttons: [
            {text: "START", callback: showGetReadyScreen, offsetX: -120},
            {text: "SCORES", callback: showHighScores, offsetX: 120}
            ]
        });
        panes.welcomeButtons.show();


    };

    var showGetReadyScreen = function(){
        panes.welcome.hide();
        panes.welcomeButtons.hide();

        panes.ready = new BouncyPane(PE, {
            content: '<h1>Get Ready</h1><p></p>',
            classes: ['getReady']
        });

        panes.ready.show();
        Timer.setTimeout(startGame,2000);
    };

    var showHighScores = function(){
        throw "Woah Slow Down! Not Implemented Dude!";
    };

    var restartGame = function(){
        alert('restart game');
        throw "Woah Slow Down! Not Implemented Dude!";
    };

    var shareGame = function(){
        throw "Woah Slow Down! Not Implemented Dude!";
    };

    var showGameOverScreen = function(){
        panes.gameOver = new BouncyPane(PE, {
            content: '<h1>Game Over</h1>',
            classes: ['gameOver']
        });
        panes.gameOver.show();

        panes.gameOverButtons = new ButtonPane(mainRenderNode, {
            buttons: [
            {text: "OK", callback: restartGame, offsetX: -120},
            {text: "SHARE", callback: shareGame, offsetX: 120}
            ]
        });

        var scoreSurface = new Surface({
            content: '<h1>0</h1>',
            classes: ['scorer']
        });
        var scoreModifier = new Modifier({
            transform: Matrix.translate(180,40,0),
            origin: [.5,.5]
        });

        var highScoreSurface = new Surface({
            content: '<h1>999</h1>',
            classes: ['scorer']
        });
        var highScoreModifier = new Modifier({
            transform: Matrix.translate(180,140,0),
            origin: [.5,.5]
        });


        //display the score pane
        Timer.setTimeout(function(){
            AppUtils.loadFragment('/fragments/finalScore.html', 
                {score:1, highScore:999},
                function(frag){
                    panes.finalScore = new SlideUpPane(mainRenderNode,
                    {
                        size:[500,250],
                        content: frag,
                        classes: ['finalScore']
                    });
                    panes.finalScore.surface.add(scoreModifier).link(scoreSurface);
                    panes.finalScore.surface.add(highScoreModifier).link(highScoreSurface);
                    panes.finalScore.show();
                }
                );  
        }, 300);


        //display the buttons pane
        Timer.setTimeout(function(){
            panes.gameOverButtons.show();
        },600);
    };//end function

    function startGame(){
        console.log("starting game");
        game.started = true;
        game.ended = false;
        
        //get the UI in the correct state
        panes.welcome.hide();
        panes.welcomeButtons.hide();
        panes.ready.hide();

        game.scorer = new Score();
        game.scorer.attachToPhysics(PE);

        timers.pipes = Timer.setInterval(spawnPipes,1000);
        

        //attach forces to physics
        PE.attach([gravity]);

        var wall = new Wall({
            n: [0,-1,0],
            d: 280,
            restitution : 0
        });

        PE.attach(wall,birdie.particle);
        wall.on('collision', endGame);


        //let er fly!
        birdie.start();
    };


    //Bummer dude, game over
    function endGame(){
        if(!game.ended){
            game.ended = true;
            AppUtils.playSound(Sounds.die);
            showGameOverScreen();

            Timer.removeInterval(timers.pipes);
            Timer.removeInterval(timers.floor);
            Timer.removeInterval(timers.clouds);

            birdie.stop();

            game.scorer.hide();

            Doooooh();
            stopTheWorld();
        }//end if game playing
    };//end method

    function Doooooh(){
        //flash the screen
        flashSurface.setClasses(['gameOverFlash','gameOverFlashActive']);
        flashModifier.setOpacity(.75, {duration: 50}, function(){
            flashModifier.setOpacity(0, {duration: 50});
            flashSurface.setClasses(['gameOverFlash']);
        });

        //shake it
        var spring = {
            method: 'spring',
            period: 100,
            dampingRatio: .1
        };

        mainModifier.setTransform(
         Matrix.translate(-10,-10,0)
         );
        mainModifier.setTransform(
         Matrix.translate(0,0,0)
         , spring);

    };

    function score(data){

        //read the score from the pipe
        var score = data.target.node.object.content;

        //NOTE: Each pipe ends up creating a lot of hits, so only score it once
        if(game.score != score){
            game.score = score;
            game.scorer.setScore(score);
            AppUtils.playSound(Sounds.score);
        }
    };


    function handleClicks(evt){
        if (!game.ended && game.started){
            //fly little birdie fly 
            birdie.flap();
        }
    }

    //get this party started
    spawnGame();
    showWelcomeScreen();

    Engine.on('click', handleClicks);
    Engine.on('touchstart', handleClicks);
    Engine.on('keydown', handleClicks);


    //determine the scale of the window
    var scaleX = window.innerHeight / 960;
    var scaleY = window.innerWidth / 640;
    var scale = Math.min(scaleX, scaleY);


    //create the game over flash surface
    var flashSurface = new Surface({
        size : wallSize,
        classes: ['gameOverFlash']
    });
    var flashModifier = new Modifier({
        opacity: .001,//hack to get around a bug
        origin: [.5,.5]
    });


    mainCtx.add(new Modifier({
        origin : [.5,.5],
        transform: Matrix.scale(scale,scale,1)
    })).link(mainRenderNode);

    //add the flash screen
    mainRenderNode.add(flashModifier).link(flashSurface);

});

