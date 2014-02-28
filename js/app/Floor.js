define(function(require, exports, module) {

	//Includes Famous Repositories
    var Engine = require('famous/Engine');
    var Surface = require('famous/Surface');

  
    /** @constructor */
    function Floor(opts){

        if(!opts) opts = {};
        this.opts = {
            velocity	  : -.4,
            initPos: opts.initPos !== undefined?opts.initPos : 700
        };
    };

    Floor.prototype.attachToPhysics = function(physicsEngine){
    	//add the floor off screen
        
        this.surfaces = 
            new Surface({
                size    : [128*12, 215],
                classes : ['floor'],
                content : '<img width="100" src="/content/images/logos.svg"/>'+
                    '<b>By: Tom Watson</b>' +
                    '<label>Built on: Famo.us</label>' +
                    '<p>Original Game Design: Dong Nguyen</p>'
        });

	    //Create a physical particle
        this.particle = physicsEngine.createBody({
                    shape : physicsEngine.BODIES.RECTANGLE,
                    m : 0,
                    size : [128*12, 265],
                    p : [this.opts.initPos, 372 , 0],
                    v : [this.opts.velocity,0,0]
        });

        //Render the Famous Surface from the particle
        this.particle.link(this.surfaces);



        //add collision
        return this.particle;
    };


	module.exports = Floor;
});

