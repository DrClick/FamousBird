define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Surface     = require("famous/core/Surface");
    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var View        = require("famous/core/View");
    var Circle      = require("famous/physics/bodies/Circle");

    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");

      
    /** @constructor */
    function Cloud(options){
        View.apply(this, arguments);

        _create.call(this);
    }

    Cloud.prototype = Object.create(View.prototype); 
    Cloud.prototype.constructor = Cloud;
    Cloud.DEFAULT_OPTIONS = {};

  
    function _create(){
        this.physicsEngine = PhysicsEngineFactory.getEngine();

        this.setOptions({
            yPos        : _getYPos(),
            scale       : 2 + 2 * Math.random(),
            opacity     : 1 / (1.1 + Math.random()),
            velocity    : -.2 - Math.random() * .1,
            cloudType   : "cloud-type-" + parseInt((Math.random() * 1000)) % 3
        });
    	
        this.modifier = new Modifier({
	        transform: Transform.multiply(
                Transform.translate(0,this.options.yPos, Math.random() * -3),
                Transform.scale(this.options.scale, this.options.scale, 1)),
            opacity: this.options.opacity
	    });

	    //add the cloud off screen
        this.surface = new Surface({
            size : [128, 64],
            classes : ["cloud", this.options.cloudType]
        });

	    //Create a physical particle
        this.particle = new Circle({
            mass : 0,
            radius : 0,
            position : [820,0,0],
            velocity : [this.options.velocity,0,0]
        });

        //Render the Famous Surface from the particle
        this.physicsEngine.addBody(this.particle);
        this._add(this.particle).add(this.modifier).add(this.surface);

        this.surface.pipe(this._eventOutput);

    }

    function _getYPos(){
        return -10 + Math.random() * 200;
    }

    Cloud.prototype.restart = function(){
        this.particle.setPosition([820, _getYPos(), Math.random() * -3]);
    };


	module.exports = Cloud;
});

