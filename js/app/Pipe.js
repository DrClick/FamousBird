define(function(require, exports, module) {

	//Includes Famous Repositories
    var Engine = require('famous/Engine');
    var Surface = require('famous/Surface');

    var Modifier = require("famous/Modifier");
    var Matrix = require("famous/Matrix");

      
    /** @constructor */
    function Pipe(opts){

        if(!opts) opts = {};
        this.opts = {
            id              : opts.id,
            velocity	    : -.4,
            gapHeight	    : Math.random() * 190,
            gapDirection    : (Math.random() * 100 % 2) == 0 ? -1: 1,
            pipeHeight      : 480,
            pipeWidth       : 113,
            pipeScale       : 2
        };
    };

    Pipe.prototype.id = function(){
        return "Hello World"
    };

    Pipe.prototype.attachToPhysics = function(physicsEngine){
    	this.modifier =
            new Modifier({
                transform: Matrix.rotateZ(Math.PI),
                origin: [0.5, 0.5]
            });
        
	    //add the pipe off screen
        var gapOffset = this.opts.gapHeight * this.opts.gapDirection;
        this.surfaces = [
            new Surface({
                size : [this.opts.pipeWidth, this.opts.pipeHeight-230 + gapOffset],
                classes : ['pipe','upper', 'unselectable'],
                content : this.opts.id
            }),
            new Surface({
                size : [this.opts.pipeWidth, this.opts.pipeHeight-200 - gapOffset],
                classes : ['pipe','lower']
            })
        ];

	    //Create a physical particle
        this.particles = 
            [
                //upper pipe
                physicsEngine.createBody({
                    shape : physicsEngine.BODIES.RECTANGLE,
                    m : 0,
                    size : [this.opts.pipeWidth, (this.opts.pipeHeight-200) + gapOffset],
                    p : [400, -370 + gapOffset/2, 0],
                    v : [this.opts.velocity,0,0]
                }),
                //lower pipe
                physicsEngine.createBody({
                    shape : physicsEngine.BODIES.RECTANGLE,
                    m : 0,
                    size : [this.opts.pipeWidth, (this.opts.pipeHeight-200) - gapOffset],
                    p : [400, 125 + gapOffset/2, 0],
                    v : [this.opts.velocity,0,0]
                })
            ];

        //Render the Famous Surface from the particle
        this.particles[0].link(this.modifier).link(this.surfaces[0]);
        this.particles[1].link(this.surfaces[1]);

        return this.particles;

    };


	module.exports = Pipe;
});

