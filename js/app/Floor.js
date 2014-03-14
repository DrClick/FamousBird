define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Engine = require('famous/Engine');
    var Surface = require('famous/Surface');

  
    /** @constructor */
    function Floor(game, physicsEngine, opts){
        this.game = game;
        this.physicsEngine = physicsEngine;
        _init.call(this, opts);
        _create.call(this);
    };

    function _init(opts){
        if(!opts) opts = {};
        this.opts = {
            velocity      : -.4,
            initPos: opts.initPos !== undefined?opts.initPos : 700
        };
    }//end init

    function _create(){
    	//add the floor off screen
        
        this.surface = 
            new Surface({
                size    : [128*20, 18],
                classes : ['grass']
        });

            /*content : '<img width="100" src="/content/images/logos.svg"/>'+
                    '<b>By: Tom Watson</b>' +
                    '<label>Built on: Famo.us</label>' +
                    '<p>Original Game Design: Dong Nguyen</p>'*/

	    //Create a physical particle
        this.particle = this.physicsEngine.createBody({
                    shape : this.physicsEngine.BODIES.RECTANGLE,
                    m : 0,
                    size : [128*20, 18],
                    p : [this.opts.initPos, 273 , 1],
                    v : [this.opts.velocity,0,0]
        });

        //Render the Famous Surface from the particle
        this.particle.add(this.surface);

        this.surface.pipe(this.game.surface);

        //add collision
        return this.particle;
    }//end create

    Floor.prototype.restart = function(){
        this.particle.setPos([this.opts.initPos, 273,1]);
    }


	module.exports = Floor;
});

