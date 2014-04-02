define(function(require, exports, module) {
    "use strict";
	//includes Famous
    var Surface = require("famous/core/Surface");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var RenderNode = require("famous/core/RenderNode");
    var Modifier = require("famous/core/Modifier");
    var Transform = require("famous/core/Transform");
    var Timer = require("famous/utilities/Timer");
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var Rectangle   = require("famous/physics/bodies/Rectangle");
    var View = require("famous/core/View");

    //include forces and constraints
    var VectorField = require("famous/physics/forces/VectorField");
    var Overlap = require("app/Overlap");
    var Wall = require("famous/physics/constraints/Wall");
    
    //Game Elements
    var Birdie = require("app/Bird");
    var Cloud = require("app/Cloud");
    var Pipe = require("app/Pipe");
    var Floor = require("app/Floor");
    var Score = require("app/Score");
    
    var GameSounds = require("app/GameSounds");

    //Widgets
    var BouncyPane = require("app/widgets/BouncyPane");
    var ButtonPane = require("app/widgets/ButtonPane");
    var SlideUpPane = require("app/widgets/SlideUpPane");

    //Utils
    var Utils = require('famous/utilities/Utility');
    var AppUtils = require("app/Util");

    //Transitions
    var Transitionable = require("famous/transitions/Transitionable");
    var SpringTransition = require("famous/transitions/SpringTransition")

    //View
    var GameOverView = require("app/views/GameOverView");


    Transitionable.registerMethod("spring", SpringTransition);

    function Game(){
        View.apply(this, arguments);

        //create the container and link the physics engine
        this.surface = new ContainerSurface({
            size : this.options.boardSize,
            classes: ["game"]
        });

        _create.call(this);
        _init.call(this);

    };//end class
    Game.prototype = Object.create(View.prototype); 
    Game.prototype.constructor=Game; 
    Game.DEFAULT_OPTIONS = {
        gravityStrength     : .0015,
        boardSize           : [640,960],
        pipeSpawnTime       : 1000,
        cloudSpawnTime      : 1000,
        gameVelocity        : 1
    };


    function _create(){
        this.visible        = true;
        this.started        = false;
        this.ended          = false;
        this.scorer         = null;
        this.score          = null;
        this.counters       = {pipe: 0, cloud: 0, floor: 0};
        this.birdie         = null;
        this.timers         = {clouds:null, pipes:null, floor: null, clean: null, counter: null};
        this.panes          = {welcome: null, gameOver: null, welcomeButtons: null, finalScore: null, gameOverButtons: null};
        this.physicsEngine  = new PhysicsEngine({numConstraints: 4});

        this.birdie         = new Birdie(this.physicsEngine);

        //holders for the objects
        this.pipes          = [null, null, null];
        this.clouds         = [null, null, null, null, null, null, null, null, null, null];
        this.floor          = [null, null, null];

        

        this.modifier = new Modifier({
            transform: Transform.translate(0,0,0),
            origin: [0,0]
        });
        
        //add the surface to the view and the physics to the surface
        this.add(this.modifier).add(this.surface);
        this.surface.add(this.physicsEngine);

        //create gravity
        this.gravity = new VectorField({
            name : VectorField.FIELDS.CONSTANT, 
            strength : this.options.gravityStrength
        });

        //add the bird
        this.surface.add(this.birdie);


        //add the floor
        var floorSurface = new Surface({
            classes: ["floor"],
            size:[640,215]
        });
        this.surface.add(new Modifier({transform: Transform.translate(0,745,0), origin:[0,0]})).add(floorSurface);


        _spawnFloor.call(this);

        //pipe events up and handle clicks
        this.surface.pipe(this._eventOutput);

        if( AppUtils.isMobile() ) { 
            this.surface.on("touchstart", _handleClicks.bind(this));
        } else { 
            this.surface.on("click", _handleClicks.bind(this));
        }
    }//end create


    function _init(){ 
        _showWelcomeScreen.call(this);
        _spawn.call(this);
    }//end init

    function _start(){

        this.started = true;
        this.ended = false;
        
        //get the UI in the correct state
        this.panes.welcome.hide();
        this.panes.welcomeButtons.hide();
        this.panes.ready.hide();

        this.scorer = new Score();
        this.scorer.attachToPhysics(this.physicsEngine);
        this.surface.add(this.scorer);

        this.timers.pipes = Timer.setInterval(_spawnPipes.bind(this),1200);
        

        //attach forces to physics
        this.gravityID = this.physicsEngine.attach([this.gravity]);

        //create a wall to cover the floor
        var ground = new Rectangle({
            mass: 0,
            size : [this.options.boardSize[0], 1],
            position : [0, 745]
        });

        // //attatch the wall and look for collisions with the birdie
        this.physicsEngine.addBody(ground);
        var groundOverlap = new Overlap();
        groundOverlap.on("hit", _onGroundCollision.bind(this));
        this.physicsEngine.attach(groundOverlap, ground, this.birdie.particle);


        //let er fly!
        this.birdie.start();
    }//end start

    function _onGroundCollision(){
        this.physicsEngine.sleep();
        this.birdie.halt();
        //console.log("death on the ground");
        _end.call(this);

        //hack to keep from constantly firing collisions, if done inline, causes
        //errors
        Timer.setTimeout(function(){
            this.physicsEngine.sleep();
        }.bind(this), 500);
    }



    function _stop(){
        this.birdie.stop();

        //stop all the particles accept let the birdie fall down.
        this.physicsEngine.getBodies().forEach(function(b){
            if(b.name == "Birdie Particle") return;

            b.setVelocity([0,0,0]);
        });
        //this.physicsEngine.detach(this.gravityID);
    };//end stop

    function _clearTimers(){
        //clear the timers
        for(var t in this.timers){
            Timer.clear(this.timers[t]);
            this.timers[t] = null;
        }
    }


    function _end(){
         //Bummer dude, game over
        if(!this.ended){
            this.ended = true;
            
            _clearTimers.call(this);

            //stop everything moving
            _stop.call(this);

            //flash and shake the screen
            _doooooh.call(this);


            //show the game over screen
            _showGameOverScreen.call(this);
        }//end if game playing
    }//end end


    function _incrementScore(data){
        //read the score from the pipe
        var score = data.target.pipeNumber;

        //NOTE: Each pipe ends up creating a lot of hits, so only score it once
        if(this.score != score){
            this.score = score;
            this.scorer.setScore(score);

            GameSounds.playSound( 2, 1.0 );
        }
    };//end method


    function _handleClicks(evt){
        evt.stopPropagation();//dont want to pass these up
        
        if (!this.ended && this.started){
            //fly little birdie fly 
            this.birdie.flap();
        }//end if playing
    };//end method





    //DO THIS NEXT - EXTRACT SPAWN CLASS
    function _spawnClouds(){
        if(!this.ended){
            var cloud = this.clouds[this.counters.cloud];
            if(cloud == null){
                cloud = new Cloud(this.physicsEngine);
                this.clouds[this.counters.cloud] = cloud;

                this.surface.add(cloud);
            }//end if cloud not created yet
            else{
                cloud.restart();
            }

            this.counters.cloud = (this.counters.cloud + 1) % this.clouds.length;
        }//end if game not ended
    };//end method

    function _spawnPipes(){
        if(!this.ended){
            var pipes = this.pipes[this.counters.pipe % this.pipes.length];
            if(pipes == null){
                pipes = new Pipe(
                    this.physicsEngine,
                    {id:this.counters.pipe + 1}
                );



                //detects overlaps with pipes and the birdie
                var overlap_top = new Overlap();
                overlap_top.on("hit", _end.bind(this));
                this.physicsEngine.attach(overlap_top, pipes.particles[0], this.birdie.particle);

                var overlap_bottom = new Overlap();
                overlap_bottom.on("hit", _end.bind(this));
                this.physicsEngine.attach(overlap_bottom, pipes.particles[1], this.birdie.particle);

                //detect overlaps with the upper pipe and the scorer
                var overlapScore = new Overlap();
                overlapScore.on("hit", function(data){
                    _incrementScore.call(this, data);
                }.bind(this));
                this.physicsEngine.attach(overlapScore, pipes.particles[0], this.scorer.particle);


                this.surface.add(pipes);


                this.pipes[this.counters.pipe % this.pipes.length] = pipes;

            }//end if pipes did not exist
            else{
                pipes.restart({id:this.counters.pipe + 1});
            }

            //incrament the counter
            this.counters.pipe++;
        }//end if game not over
    };//end method

    function _spawnFloor(){
        if(!this.ended){
            var floor = this.floor[this.counters.floor];
            if(floor == null){
                var opts = {};
                if (this.counters.floor == 0){opts.initPos = 0;}
                floor = new Floor(this, this.physicsEngine, opts);
                this.floor[this.counters.floor] = floor;

                this.surface.add(floor);
            }//end if floor not created yet
            else{
                floor.restart();
            }


            this.counters.floor = (this.counters.floor + 1) % this.floor.length;
        }//end if game not ended
    };//end method

    function _spawn(){
        //Spawn the scene
        this.timers.clouds  = Timer.setInterval(_spawnClouds.bind(this),1000);
        this.timers.floor   = Timer.setInterval(_spawnFloor.bind(this),1000);
    }//end spawn

    function  _showWelcomeScreen(){
        this.panes.welcome = new BouncyPane(this.physicsEngine, {
            content: "<h1>Famous Bird</h1>",
            classes: ["startup"]
        });

        this.surface.add(this.panes.welcome);
        this.panes.welcome.show();

        this.panes.welcomeButtons = new ButtonPane({
            buttons: [
                {text: "START", callback: _showGetReadyScreen.bind(this), offsetX: -120},
                {text: "SCORES", callback: _showHighScores.bind(this), offsetX: 120}
            ]
        });
        this.surface.add(this.panes.welcomeButtons);
        this.panes.welcomeButtons.show();


        //make sure draggable events on these views are piped up
        this.panes.welcome.pipe(this._eventOutput);
        this.panes.welcomeButtons.pipe(this._eventOutput);
    };

    function _showGetReadyScreen(){
        this.panes.welcome.hide();
        this.panes.welcomeButtons.hide();

        this.panes.ready = new BouncyPane(this.physicsEngine, {
            content: "<h1>Get Ready</h1><p></p>",
            classes: ["getReady"]
        });


        this.surface.add(this.panes.ready)
        this.panes.ready.show();
        //make sure draggable events on these views are piped up
        this.panes.ready.pipe(this._eventOutput);
        Timer.setTimeout(_start.bind(this), 2000);
    };

    function _showGameOverScreen(){
        this.scorer.hide();

        this.panes.gameOver = new GameOverView(this.physicsEngine, {score: this.score});
        this.surface.add(this.panes.gameOver);
        this.panes.gameOver.show();

    };//end function

    


    function _doooooh(){

        GameSounds.playSound(1, 1.0);


        //create the game over flash surface
        var flashSurface = new Surface({
            size : [undefined, undefined],
            classes: ["gameOverFlash"]
        });
        var flashModifier = new Modifier({
            opacity: .001,//hack to get around a bug
            origin: [0,0]
        });

        //add the flash screen
        this._add(flashModifier).add(flashSurface);

        

        //flash the screen
        flashSurface.setClasses(["gameOverFlash","gameOverFlashActive"]);
        flashModifier.setOpacity(.75, {duration: 50}, function(){
            flashModifier.setOpacity(0, {duration: 50});
            flashSurface.setClasses(["gameOverFlash"]);
            flashModifier.setTransform(Transform.translate(0,0,-1));
        });



        //shake the screen
        var spring = {
            method: "spring",
            period: 100,
            dampingRatio: .1
        };

        //in order to shake the screen, we displace it, then move it back using our spring
        //we do this so that it shake about the origin
        this.modifier.setTransform(Transform.translate(-10,-10,0));
        this.modifier.setTransform(Transform.translate(0,0,0),spring);

    };//end method


    function _showHighScores(){
        alert("Whoah! This agression will not stand man! This hasnt been implemented.");
    };

    

    Game.prototype.hide = function(){
        this.visible = false;
    };//end show
    Game.prototype.show = function(){
        this.visible = true;
    };//end show

    Game.prototype.render = function(){
        return this.visible ? this._node.render() : undefined;
    };//end render
  
    module.exports = Game;
});
