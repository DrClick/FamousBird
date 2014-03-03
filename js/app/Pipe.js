define(function(require, exports, module) {

	//Includes Famous Repositories
    var Engine = require('famous/Engine');
    var Surface = require('famous/Surface');

    var Modifier = require("famous/Modifier");
    var Matrix = require("famous/Matrix");

      
    /** @constructor */
    function Pipe(physicsEngine, opts){
        this.physicsEngine = physicsEngine;
        _init.call(this, opts);
        _create.call(this);
    };

    function _init(opts){
        if(!opts) opts = {};
        this.opts = {
            id              : opts.id,
            velocity        : -.4,
            gapHeight       : Math.random() * 190,
            gapDirection    : (Math.random() * 100 % 2) == 0 ? -1: 1,
            pipeHeight      : 480,
            pipeWidth       : 113,
            pipeScale       : 2
        };
    }//end init

    function _create(){
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
                this.physicsEngine.createBody({
                    shape : this.physicsEngine.BODIES.RECTANGLE,
                    m : 0,
                    size : [this.opts.pipeWidth, (this.opts.pipeHeight-200) + gapOffset],
                    p : [400, -370 + gapOffset/2, 0],
                    v : [this.opts.velocity,0,0]
                }),
                //lower pipe
                this.physicsEngine.createBody({
                    shape : this.physicsEngine.BODIES.RECTANGLE,
                    m : 0,
                    size : [this.opts.pipeWidth, (this.opts.pipeHeight-200) - gapOffset],
                    p : [400, 125 + gapOffset/2, 0],
                    v : [this.opts.velocity,0,0]
                })
            ];

        //Render the Famous Surface from the particle
        this.particles[0].link(this.modifier).link(this.surfaces[0]);
        this.particles[1].link(this.surfaces[1]);

    }//end create

    Pipe.prototype.restart = function(opts){
        var gapHeight       = Math.random() * 190;
        var gapDirection    = (Math.random() * 100 % 2) == 0 ? -1: 1;
        var gapOffset = this.opts.gapHeight * this.opts.gapDirection;

        this.surfaces[0].setContent(opts.id);

        this.surfaces[0].size = [this.opts.pipeWidth, this.opts.pipeHeight-230 + gapOffset];
        this.particles[0].p.setFromArray([400, -370 + gapOffset/2, 0]);

        this.surfaces[1].size = [this.opts.pipeWidth, this.opts.pipeHeight-200 - gapOffset];
        this.particles[1].p.setFromArray([400, 125 + gapOffset/2, 0]);

    };


	module.exports = Pipe;
});

