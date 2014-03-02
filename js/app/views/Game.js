define(function(require, exports, module) {
    "use strict";
	//includes Famous
    var Surface = require("famous/Surface");
    var ContainerSurface = require("famous/ContainerSurface");
    var RenderNode = require("famous/RenderNode");
    var Modifier = require("famous/Modifier");
    var Matrix = require("famous/Matrix");
    var Timer = require("famous-utils/Time");
    var PhysicsEngine = require('famous-physics/PhysicsEngine');

    //include forces and constraints
    var VectorField = require("famous-physics/forces/VectorField");
    var Overlap = require("app/Overlap");
    var Wall = require("famous-physics/constraints/Wall");
    
    //Game Elements
    var Birdie = require("app/Bird");
    var Cloud = require("app/Cloud");
    var Pipe = require("app/Pipe");
    var Floor = require("app/Floor");
    var Score = require("app/Score");
    var Sounds = require("app/Sounds");

    //Widgets
    var BouncyPane = require("app/widgets/BouncyPane");
    var ButtonPane = require("app/widgets/ButtonPane");
    var SlideUpPane = require("app/widgets/SlideUpPane");

    //Utils
    var AppUtils = require("app/Util");
    var Sounds = require("app/Sounds");

    //Transitions
    var Transitionable = require("famous/Transitionable");
    var SpringTransition = require("famous-physics/utils/SpringTransition")

    //View
    var View = require("famous/View");


    Transitionable.registerMethod("spring", SpringTransition);

    function Game(opts){
        View.apply(this, arguments);

        if(!opts) opts = {};
        this.opts = {
            gravityStrength     : .002,
            boardSize           : [640,960],
            pipeSpawnTime       : 1000,
            cloudSpawnTime      : 1000
        };
        if (opts) this.setOpts(opts);


        //Properties
        this.started        = false;
        this.ended          = false;
        this.scorer         = null;
        this.score          = null;
        this.pipeCounter    = 1;
        this.birdie         = null;
        this.timers         = {clouds:null, pipes:null, floor: null, clean: null, counter: null};
        this.panes          = {welcome: null, gameOver: null, welcomeButtons: null, finalScore: null, gameOverButtons: null};
        this.node           = new RenderNode();
        this.physicsEngine  = new PhysicsEngine({numConstraints : 4});

        this.birdie         = new Birdie(this.physicsEngine);

        //create the container and link the physics engine
        this.surface = new ContainerSurface({
            size : this.opts.boardSize,
            classes: ["game"],
            properties: {
                border: "2px solid black",
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }
        });

        this.modifier = new Modifier({
            transform: Matrix.translate(0,0,0),
            origin: [.5,0]
        });
        
        //note node is part of the base view
       
        
        this._add(this.modifier).link(this.surface);
        this.surface.add(this.physicsEngine);

        //create gravity
        this.gravity = new VectorField({
            name : VectorField.FIELDS.CONSTANT, 
            strength : this.opts.gravityStrength
        });

        //create the initial floor
        var initFloor = new Floor({initPos:400});
        initFloor.attachToPhysics(this.physicsEngine);



        var me = this;
        this.surface.pipe(this.eventOutput);
        this.surface.on("keyup", function(){me.handleClicks();});
        this.surface.on("click", function(){me.handleClicks();});
        this.surface.on("touchstart", function(){me.handleClicks();});

        this.init();
    };//end class
    Game.prototype = Object.create(View.prototype); 
    Game.prototype.constructor=Game; 




    Game.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };//end method

    Surface.prototype.on = function(type, fn) {
        if(this._currTarget) this._currTarget.addEventListener(type, this.eventForwarder);
        this.eventHandler.on(type, fn);
    };

    Game.prototype.init = function(){
        var me = this;
        showWelcomeScreen(me);
        spawn(me);
    };

    Game.prototype.start = function(){
        var me = this;

        me.started = true;
        me.ended = false;
        
        //get the UI in the correct state
        me.panes.welcome.hide();
        me.panes.welcomeButtons.hide();
        me.panes.ready.hide();

        me.scorer = new Score();
        me.scorer.attachToPhysics(me.physicsEngine);

        me.timers.pipes = Timer.setInterval(function(){spawnPipes(me);},1000);
        

        //attach forces to physics
        me.physicsEngine.attach([this.gravity]);

        //create a wall to cover the floor
        var wall = new Wall({
            n: [0,-1,0],
            d: 280,
            restitution : 0
        });

        //attatch the wall and look for collisions with the birdie
        this.physicsEngine.attach(wall, this.birdie.particle);
        wall.on("collision", function(){me.end();});

        //let er fly!
        this.birdie.start();
    };

    Game.prototype.restart = function(){
        this.eventOutput.emit("restart");
    };

    Game.prototype.stop = function(){
        this.birdie.stop();

        var len = this.physicsEngine._particles.length - 1;
        for (var i = len; i >= 0; i--) {
            this.physicsEngine._particles[i].v.x = 0;
        };
    };//end method


     //Bummer dude, game over
    Game.prototype.end = function(){
        if(!this.ended){
            var me = this;
            me.ended = true;
            
            //clean up timers
            Timer.removeInterval(me.timers.pipes);
            Timer.removeInterval(me.timers.floor);
            Timer.removeInterval(me.timers.clouds);

            //stop everything moving
            me.stop();

            //flash and shake the screen
            Doooooh(me);

            //show the game over screen
            showGameOverScreen(me);
        }//end if game playing
    };//end method


    Game.prototype.incrementScore = function(data){
        //read the score from the pipe
        var score = data.target.node.object.content;

        //NOTE: Each pipe ends up creating a lot of hits, so only score it once
        if(this.score != score){
            this.score = score;
            this.scorer.setScore(score);
            AppUtils.playSound(Sounds.score);
        }
    };//end method


    Game.prototype.handleClicks = function(evt){
        
        if (!this.ended && this.started){
            console.log("click!!!")
            //fly little birdie fly 
            this.birdie.flap();

        }//end if playing
    };//end method





    //DO THIS NEXT - EXTRACT SPAWN CLASS
    var spawnClouds = function(game){
        if(!game.ended){
            var cloud = new Cloud();
            cloud.attachToPhysics(game.physicsEngine);
        }//end if game not ended
    };//end method

    var spawnPipes = function(game){
        if(!game.ended){
            var pipe = new Pipe({id:game.pipeCounter});
            var pipeParticles = pipe.attachToPhysics(game.physicsEngine);

            game.pipeCounter++;//increment pipe


            //detects overlaps with pipes and the birdie
            var overlap = new Overlap();
            overlap.on("hit", function(){game.end();});
            game.physicsEngine.attach(overlap, pipeParticles, game.birdie.particle);

            //detect overlaps with the upper pipe and the scorer
            var overlapScore = new Overlap();
            overlapScore.on("hit", function(data){game.incrementScore(data);});
            game.physicsEngine.attach(overlapScore, pipeParticles[0], game.scorer.particle);
        }//end if game not over
    };//end method

    var spawnFloor = function(game){
        if(!game.ended){
            var floor = new Floor();
            var floorParticle = floor.attachToPhysics(game.physicsEngine);
        }//end if not game over
    };//end method

    var cleanupObjects = function(physicsEngine){
        var numParticles = physicsEngine._particles.length;

        for (var i = physicsEngine._particles.length - 30; i >= 3; i--) {
            physicsEngine.remove(physicsEngine._particles[i]);
        };
        
    };//end method

    var spawn = function(game){
        //Spawn the scene
        game.timers.clouds  = Timer.setInterval(function(){spawnClouds(game);},1000);
        game.timers.floor   = Timer.setInterval(function(){spawnFloor(game);},2000);
        game.timers.clean   = Timer.setInterval(function(){cleanupObjects(game.physicsEngine);}, 2000);
    };//end method


    

    var showWelcomeScreen = function(game){
        game.panes.welcome = new BouncyPane(game.physicsEngine, {
            content: "<h1>Famous Bird</h1>",
            classes: ["startup"]
        })
        game.panes.welcome.show();

        game.panes.welcomeButtons = new ButtonPane(game, {
            buttons: [
            {text: "START", callback: function(){showGetReadyScreen(game);}, offsetX: -120},
            {text: "SCORES", callback: function(){showHighScores(game);}, offsetX: 120}
            ]
        });
        game.panes.welcomeButtons.show();
    };

    var showGetReadyScreen = function(game){
        game.panes.welcome.hide();
        game.panes.welcomeButtons.hide();

        game.panes.ready = new BouncyPane(game.physicsEngine, {
            content: "<h1>Get Ready</h1><p></p>",
            classes: ["getReady"]
        });

        game.panes.ready.show();
        Timer.setTimeout(function(){game.start();}, 2000);
    };

    var showGameOverScreen = function(game){
        game.scorer.hide();

        game.panes.gameOver = new BouncyPane(game.physicsEngine, {
            content: "<h1>Game Over</h1>",
            classes: ["gameOver"]
        });
        game.panes.gameOver.show();

        game.panes.gameOverButtons = new ButtonPane(game, {
            buttons: [
                {text: "OK", callback: function(){game.restart();}, offsetX: -120},
                {text: "SHARE", callback: function(){share(game);}, offsetX: 120}
            ]
        });

        var scoreSurface = new Surface({
            content: "<h1>0</h1>",
            classes: ["scorer"]
        });
        var scoreModifier = new Modifier({
            transform: Matrix.translate(180,40,50),
            origin: [.5,.5]
        });

        var highScoreSurface = new Surface({
            content: "<h1>999</h1>",
            classes: ["scorer"]
        });
        var highScoreModifier = new Modifier({
            transform: Matrix.translate(180,140,50),
            origin: [.5,.5]
        });


        //display the score pane
        Timer.setTimeout(function(){
            AppUtils.loadFragment("/fragments/finalScore.html", 
                {score:1, highScore:999},
                function(frag){
                    game.panes.finalScore = new SlideUpPane(game,
                    {
                        size:[500,250],
                        content: frag,
                        classes: ["finalScore"]
                    });
                    game.panes.finalScore.surface.add(scoreModifier).link(scoreSurface);
                    game.panes.finalScore.surface.add(highScoreModifier).link(highScoreSurface);
                    game.panes.finalScore.show();
                }
                );

            //start the score counting up
            var scoreUpCounter = 0;
            game.timers.counter = Timer.setInterval(function(){
                scoreUpCounter++;
                if(scoreUpCounter<= game.score){
                    scoreSurface.setContent("<h1>" + scoreUpCounter + "</h1>");
                }
                else{
                    Timer.removeInterval(game.timers.counter);
                }
            },40);

        }, 300);

        //display the buttons pane
        Timer.setTimeout(function(){
            game.panes.gameOverButtons.show();
        },600);
    };//end function


    var Doooooh = function(game){

        AppUtils.playSound(Sounds.die);


        //create the game over flash surface
        var flashSurface = new Surface({
            size : game.opts.boardSize,
            classes: ["gameOverFlash"]
        });
        var flashModifier = new Modifier({
            opacity: .001,//hack to get around a bug
            origin: [.5,.5]
        });

        //add the flash screen
        game._add(flashModifier).link(flashSurface);

        

        //flash the screen
        flashSurface.setClasses(["gameOverFlash","gameOverFlashActive"]);
        flashModifier.setOpacity(.75, {duration: 50}, function(){
            flashModifier.setOpacity(0, {duration: 50});
            flashSurface.setClasses(["gameOverFlash"]);
            flashModifier.setTransform(Matrix.translate(0,0,-1));
        });



        //shake the screen
        var spring = {
            method: "spring",
            period: 100,
            dampingRatio: .1
        };

        //in order to shake the screen, we displace it, then move it back using our spring
        //we do this so that it shake about the origin
        game.modifier.setTransform(Matrix.translate(-10,-10,0));
        game.modifier.setTransform(Matrix.translate(0,0,0),spring);

    };//end method


    var showHighScores = function(game){
        alert("Whoah! This agression will not stand man! This hasnt been implemented.");
    };

    var share = function(game){
        alert("This is a private beta, no sharing for now.");
    };

  
    module.exports = Game;
});

