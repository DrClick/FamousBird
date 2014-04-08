define(function(require, exports, module) {
    "use strict";
	//includes Famous
    var Surface = require("famous/core/Surface");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var RenderNode = require("famous/core/RenderNode");
    var Modifier = require("famous/core/Modifier");
    var Transform = require("famous/core/Transform");
    var Timer = require("famous/utilities/Timer");
    var Rectangle   = require("famous/physics/bodies/Rectangle");
    var View = require("famous/core/View");

    //include forces and constraints
    var PhysicsEngineFactory = require('app/PhysicsEngineFactory');
    var VectorField = require("famous/physics/forces/VectorField");
    var Overlap = require("app/Overlap");
    
    //Game Elements
    var Birdie = require("app/Birdie");
    var Cloud = require("app/Cloud");
    var Pipe = require("app/Pipe");
    var Floor = require("app/Floor");
    var Score = require("app/Score");
    var Spawn = require("app/Spawn");
    
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
    var GameOverScreen = require("app/views/GameOver");


    Transitionable.registerMethod("spring", SpringTransition);

    function Game(){
        View.apply(this, arguments);

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
        this.physicsEngine  = PhysicsEngineFactory.getEngine();

        this.birdie         = new Birdie();

        //holders for the objects
        this.pipes          = [null, null, null];
        this.clouds         = [null, null, null, null, null, null, null, null, null, null];
        this.floor          = [null, null, null];

        //create the container surface that will hold all of the game content
        this.containerSurface = new ContainerSurface({
            classes: ["game"]
        });

        //this modifier will be used shake the screen
        this.modifier = new Modifier({
            transform: Transform.translate(0,0,0),
            origin: [0,0]
        });
        
        //add the container surface to the view 
        //this.add(this.modifier).add(this.containerSurface);
        this.add(this.containerSurface);

        //create gravity
        this.gravity = new VectorField({
            name : VectorField.FIELDS.CONSTANT, 
            strength : this.options.gravityStrength
        });

        //add the bird
        this.containerSurface.add(this.birdie);


        //create a wall to cover the floor
        var ground = new Rectangle({
            mass: 0,
            size : [this.options.boardSize[0], 1],
            position : [0, 745]
        });

        //attatch a floor and look for collisions with the birdie
        this.physicsEngine.addBody(ground);
        var groundOverlap = new Overlap();
        groundOverlap.on("hit", _onGroundCollision.bind(this));
        this.physicsEngine.attach(groundOverlap, ground, this.birdie.particle);

        //add the floor surface
        var floorSurface = new Surface({
            classes: ["floor"],
            size:[640,215],
            content : 
                    "<div class='credits'>Built with Famous by <a href='mailto:drclick@mac.com'>Thomas Watson</a>. " +
                    "<i>Original Game Design: Dong Nguyen</i></div>"

        });
        this.containerSurface.add(ground).add(floorSurface);


        Spawn.floor.call(this);

        //pipe events up and handle clicks
        this.containerSurface.pipe(this._eventOutput);

        if( AppUtils.isMobile() ) { 
            this.containerSurface.on("touchstart", _handleClicks.bind(this));
        } else { 
            this.containerSurface.on("click", _handleClicks.bind(this));
        }
    }//end create


    function _init(){ 
        _showWelcomeScreen.call(this);
        Spawn.start.call(this);
    }//end init

    function _start(){

        this.started = true;
        this.ended = false;
        
        //get the UI in the correct state
        this.panes.welcome.hide();
        this.panes.welcomeButtons.hide();
        this.panes.ready.hide();

        this.scorer = new Score({classes: "main"});
        this.containerSurface.add(this.scorer);

        this.timers.pipes = Timer.setInterval(Spawn.pipes.bind(this),1200);
        

        //attach forces to physics
        this.gravityID = this.physicsEngine.attach([this.gravity]);

        


        //let er fly!
        this.birdie.start();
    }//end start

    function _onGroundCollision(){
        this.birdie.halt();
        this.physicsEngine.sleep();

        this.end.call(this);

        //hack to keep from constantly firing collisions, if done inline, causes
        //errors
        Timer.setTimeout(function(){
            this.physicsEngine.detachAll();
        }.bind(this), 3000);
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


    Game.prototype.end = function end(){
         //Bummer dude, game over
        if(!this.ended){
            this.ended = true;
            
            _clearTimers.call(this);

            //stop everything moving
            _stop.call(this);

            //flash and shake the screen
            _doooooh.call(this);


            //show the game over screen
            Timer.setTimeout(function(){
                _showGameOverScreen.call(this);
            }.bind(this), 300)
            
        }//end if game playing
    };//end end


    Game.prototype.incrementScore = function incrementScore(data){
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
    

    function  _showWelcomeScreen(){
        this.panes.welcome = new BouncyPane({
            content: "<h1>Famous Bird</h1>",
            classes: ["startup"]
        });

        this.containerSurface.add(this.panes.welcome);
        this.panes.welcome.show();

        this.panes.welcomeButtons = new ButtonPane({
            buttons: [
                {text: "START", callback: _showGetReadyScreen.bind(this), offsetX: -120},
                {text: "SCORES", callback: _showHighScores.bind(this), offsetX: 120}
            ]
        });
        this.containerSurface.add(this.panes.welcomeButtons);
        this.panes.welcomeButtons.show();


        //make sure draggable events on these views are piped up
        this.panes.welcome.pipe(this._eventOutput);
        this.panes.welcomeButtons.pipe(this._eventOutput);
    };

    function _showGetReadyScreen(){
        this.panes.welcome.hide();
        this.panes.welcomeButtons.hide();

        this.panes.ready = new BouncyPane({
            content: "<h1>Get Ready</h1><p></p>",
            classes: ["getReady"]
        });


        this.containerSurface.add(this.panes.ready)
        this.panes.ready.show();
        //make sure draggable events on these views are piped up
        this.panes.ready.pipe(this._eventOutput);
        Timer.setTimeout(_start.bind(this), 2000);
    };

    function _showGameOverScreen(){
        this.scorer.hide();

        this.panes.gameOver = new GameOverScreen({score: this.score});
        this.containerSurface.add(this.panes.gameOver);
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
