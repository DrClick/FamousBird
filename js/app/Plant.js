define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Surface     = require("famous/core/Surface");
    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var View        = require("famous/core/View");
    var Rectangle   = require("famous/physics/bodies/Rectangle");
    var Timer       = require("famous/utilities/Timer");
    var Spring      = require("famous/physics/forces/Spring");

    var GameSounds  = require("app/GameSounds");
    var Overlap     = require("app/Overlap");
    
    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");
      
    /** @constructor */
    function Plant(options){
        View.apply(this, arguments);

        _create.call(this);
    }
    Plant.prototype = Object.create(View.prototype); 
    Plant.prototype.constructor = Plant;
    Plant.DEFAULT_OPTIONS = {
        size: [80, 157],
        visible: false
    };

  
    function _create(){
        this.physicsEngine = PhysicsEngineFactory.getEngine();

        var yPos = _getYPos.call(this, this.options.pipeHeight);

	    //add the Plant off screen
        this.surface = new Surface({
            size: this.options.size,
            classes: ['plant', this.options.type]
        })

	    //Create a physical particle
        this.particle = new Rectangle({
            mass : 1,
            size: this.options.size,
            position : [0, yPos, -1]
        });

        this.spring = new Spring({
            period          : 1000,
            dampingRatio    : 1,
            length          : this.options.size[1],
            forceFunction   : Spring.FORCE_FUNCTIONS.FENE,
            anchor          : [0, yPos, 0]
        });

        //attach the paricles and surface
        this.physicsEngine.addBody(this.particle);
        this.springID = this.physicsEngine.attach(this.spring, this.particle);


        this.add(this.particle).add(this.surface);

        this.surface.pipe(this._eventOutput);


        //add the bullet
        var direction = this.options.type == "lower" ? -1 : 1;
        this.bulletSurface = new Surface({
            size:[20,20],
            classes:['icon-famous-logo'],
            properties: {fontFamily: "famous", color: "#fa5c4f", fontSize: "20px"}
        });
        this.bulletModifier = new Modifier({opacity: 0.001});
        this.bulletParticle = new Rectangle({
            size: [20, 20],
            position: [-10, yPos + (direction * (157 - 20)), 0]
        });

        this.physicsEngine.addBody(this.bulletParticle);
        this.add(this.bulletParticle)
            .add(new Modifier({size:[.001, .001], origin:[.5,.5]}))
            .add(this.bulletModifier)
            .add(this.bulletSurface);

        this.overlap = new Overlap();
        this.overlap.on("hit", _onHitBirdie.bind(this));
        
        
        

        //set the visibility
        this.visible = this.options.visible;
    }

    function _onHitBirdie(){
        console.log("Im hit");
        debugger
    }

    function _getYPos(pipeHeight){
        if(this.options.type == "lower"){
            return -pipeHeight/2 +  157/2 + 1;
        }
        else{
            return pipeHeight/2 - 157/2 - 1;
        }
    }

    Plant.prototype.restart = function(pipeHeight){
        this.options.pipeHeight = pipeHeight;
        var yPos = _getYPos.call(this, pipeHeight);
        var direction = this.options.type == "lower" ? -1 : 1;


        this.spring.setAnchor([0,yPos,0]);
        this.particle.setPosition([0, yPos, -1]);
        this.bulletParticle.setPosition([-10, yPos + (direction * (157 - 20)), 0])
        this.bulletParticle.setVelocity([0,0,0]);

        if(this.overlapId){
            this.physicsEngine.detach(this.overlapId);
            this.overlapId = undefined;
        }
    };


    Plant.prototype.hide = function(){
        //go back in the pipe
        var direction = this.options.type == "lower" ? 1 : -1;
        this.spring.setAnchor([0,157 * direction,0]);
        this.particle.setVelocity([0, direction * .8], 0);

        Timer.setTimeout(function(){
            this.visible = false;
        }.bind(this), 1000);
        
    };//end show
    Plant.prototype.show = function(){
        this.visible = true;

        //come out of the pipe
        var direction = this.options.type == "lower" ? -1 : 1;
        this.particle.setVelocity([0, direction * .2], 0);

    };//end show

    Plant.prototype.attack = function(){
        this.show();
        Timer.setTimeout(_fire.bind(this), 300);
        Timer.setTimeout(this.hide.bind(this), 1300);
    };//end show

    function _fire(){
        //get the birdie particle
        var birdieParticle = this.physicsEngine.getBodies()
                .filter(function(b){return b.name == "Birdie Particle"})[0];

        var birdiePosition = birdieParticle.getPosition().y;
        var baseHeight = this.options.type == "upper" 
            ? this.options.pipeHeight
            : 960 - this.options.pipeHeight;


        //pick a directio to fire
        var direction = birdiePosition > baseHeight ? 1 : -1; 

        this.bulletModifier.setOpacity(1);
        this.bulletParticle.setVelocity([-.25, direction * .1, 0]);

        //attach the overlap
        this.overlapId = this.physicsEngine.attach(this.overlap, this.bulletParticle, birdieParticle);

        GameSounds.playSound(3, 1.0);

    }

    Plant.prototype.render = function(){
        if (this.visible) return this._node.render();
    };//end render


	module.exports = Plant;
});

