define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Surface     = require("famous/core/Surface");
    var Rectangle   = require("famous/physics/bodies/Rectangle");
    var View        = require("famous/core/View");
  
    /** @constructor */
    function Floor(game, physicsEngine, opts){
        View.apply(this);
        this.game = game;
        this.physicsEngine = physicsEngine;
        _init.call(this, opts);
        _create.call(this);
    }

    Floor.prototype = Object.create(View.prototype); 
    Floor.prototype.constructor = Floor; 


    function _init(opts){
        if(!opts) {opts = {};}
        this.opts = {
            velocity      : -.3,
            initPos: opts.initPos !== undefined ? opts.initPos : 700
        };
    }//end init

    function _create(){
    	//add the floor off screen
        
        this.surface = 
            new Surface({
                size    : [128 * 20, 18],
                classes : ["grass"]
        });

       
	    //Create a physical particle
        this.particle = new Rectangle({
                    mass: 0,
                    size : [128 * 20, 18],
                    position : [this.opts.initPos, 750 , 2],
                    velocity : [this.opts.velocity,0,0]
        });

        //Render the Famous Surface from the particle
        this.physicsEngine.addBody(this.particle);
        this._add(this.particle).add(this.surface);

    }//end create

    Floor.prototype.restart = function(){
        this.particle.setPosition([this.opts.initPos, 750, 2]);
    };


	module.exports = Floor;
});

