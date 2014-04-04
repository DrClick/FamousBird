define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Surface     = require("famous/core/Surface");
    var Rectangle   = require("famous/physics/bodies/Rectangle");
    var View        = require("famous/core/View");

    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");
  
    /** @constructor */
    function Floor(options){
        View.apply(this, arguments);

        _create.call(this);
    }

    Floor.prototype = Object.create(View.prototype); 
    Floor.prototype.constructor = Floor; 
    Floor.DEFAULT_OPTIONS = {
        velocity: -.3,
        initPos: 0
    };

    function _create(){
        this.physicsEngine = PhysicsEngineFactory.getEngine();
        
        //add the floor off screen
        this.surface = new Surface({
            size    : [128 * 20, 18],
            classes : ["grass"]
        });

       
	    //Create a physical particle
        this.particle = new Rectangle({
            mass: 0,
            size : [128 * 20, 18],
            position : [this.options.initPos, 750 , 2],
            velocity : [this.options.velocity, 0, 0]
        });

        //Render the Famous Surface from the particle
        this.physicsEngine.addBody(this.particle);
        this._add(this.particle).add(this.surface);

    }//end create

    Floor.prototype.restart = function(){
        this.particle.setPosition([this.options.initPos, 750, 2]);
    };


	module.exports = Floor;
});

