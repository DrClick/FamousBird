define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');

    var Modifier = require("famous/core/Modifier");
    var Transform = require("famous/core/Transform");
    var View        = require("famous/core/View");
    var Rectangle   = require("famous/physics/bodies/Rectangle");

      
    /** @constructor */
    function Pipe(physicsEngine, opts){
        View.apply(this);

        this.physicsEngine = physicsEngine;
        _init.call(this, opts);
        _create.call(this);
    };
    Pipe.prototype = Object.create(View.prototype); 
    Pipe.prototype.constructor = Pipe; 

    function _init(opts){
        if(!opts) opts = {};
        this.opts = {
            id              : opts.id,
            velocity        : -.3,
            gapHeight       : -100 + Math.random() * 300,
            gapDirection    : (Math.random() * 100 % 2) == 0 ? -1: 1,
            pipeHeight      : 480,
            pipeWidth       : 113,
            pipeScale       : 2
        };
    }//end init

    function _create(){
        
	    //add the pipe off screen
        var gapOffset = this.opts.gapHeight * this.opts.gapDirection;
        this.surfaces = [
            new Surface({
                size : [this.opts.pipeWidth, this.opts.pipeHeight-230 + gapOffset],
                classes : ['pipe','upper', 'unselectable']
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
                new Rectangle({
                    mass: 0,
                    size : [this.opts.pipeWidth, (this.opts.pipeHeight-200) + gapOffset],
                    position : [720, 0, 0],
                    velocity : [this.opts.velocity,0,0]
                }),
                //lower pipe
                new Rectangle({
                    mass : 0,
                    size : [this.opts.pipeWidth, (this.opts.pipeHeight-200) - gapOffset],
                    position : [720, 480 + gapOffset, 0],
                    velocity : [this.opts.velocity,0,0]
                })
            ];

        //Render the Famous Surface from the particle
        this.particles[0].pipeNumber = this.opts.id;
        this._add(this.particles[0]).add(this.surfaces[0]);
        this._add(this.particles[1]).add(this.surfaces[1]);

        this.surfaces[0].pipe(this._eventOutput);
        this.surfaces[1].pipe(this._eventOutput);

        this.physicsEngine.addBody(this.particles[0]);
        this.physicsEngine.addBody(this.particles[1]);

    }//end create

    Pipe.prototype.restart = function(opts){
        var gapHeight       = Math.random() * 190;
        var gapDirection    = (Math.random() * 100 % 2) == 0 ? -1: 1;
        var gapOffset = this.opts.gapHeight * this.opts.gapDirection;

        this.particles[0].pipeNumber = opts.id;

        this.surfaces[0].size = [this.opts.pipeWidth, this.opts.pipeHeight-230 + gapOffset];
        this.particles[0].setPosition([720, 0, 0]);

        this.surfaces[1].size = [this.opts.pipeWidth, this.opts.pipeHeight-200 - gapOffset];
        this.particles[1].setPosition([720, 480 + gapOffset, 0]);

    };


	module.exports = Pipe;
});

