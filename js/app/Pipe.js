define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var RenderNode = require("famous/core/RenderNode");

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
            pipeHeight      : 480,
            pipeWidth       : 113,
            initPipePos     : 700
        };
    }//end init

    function _create(){
    
        var pipeSizeAndPos = _calcPipePositionAndSize.call(this);
        var upperPipe = pipeSizeAndPos[0];
        var lowerPipe = pipeSizeAndPos[1];

	    

        this.surfaces = [
            new Surface({
                size : [this.opts.pipeWidth, upperPipe.height],
                classes : ['pipe','upper', 'unselectable']
            }),
            new Surface({
                size : [this.opts.pipeWidth, lowerPipe.height],
                classes : ['pipe','lower']
            })
        ];


        this.particles = 
            [
                //upper pipe
                new Rectangle({
                    mass: 0,
                    size : [this.opts.pipeWidth, upperPipe.height],
                    position : [this.opts.initPipePos, upperPipe.y, -2],
                    velocity : [this.opts.velocity,0,0]
                }),
                //lower pipe
                new Rectangle({
                    mass : 0,
                    size : [this.opts.pipeWidth, lowerPipe.height],
                    position : [this.opts.initPipePos, lowerPipe.y, -2],
                    velocity : [this.opts.velocity,0,0]
                })
            ];

        //set a property on the pipe used for scoring
        this.particles[0].pipeNumber = this.opts.id;


        //create render nodes for the pipes
        this.pipeNodes = [];
        this.pipeNodes.push(new RenderNode());
        this.pipeNodes.push(new RenderNode());

        this.pipeNodes[0].add(this.surfaces[0]);
        this.pipeNodes[1].add(this.surfaces[1]);

        //add the particles as modifiers
        //NOTE: It is important to add the origin modifier after adding the particle so that the
        //particle is in the middle of the surface
        this._add(this.particles[0])
            .add(new Modifier({origin:[.5,.5]}))
            .add(this.pipeNodes[0]);
        this._add(this.particles[1])
            .add(new Modifier({origin:[.5,.5]}))
            .add(this.pipeNodes[1]);


        //add the particles to the physics engine
        this.physicsEngine.addBody(this.particles[0]);
        this.physicsEngine.addBody(this.particles[1]);

        //pipe events so clicks on the pipes will bubble up 
        this.surfaces[0].pipe(this._eventOutput);
        this.surfaces[1].pipe(this._eventOutput);



        //add the plants
        this.plants = [];
        this.plants.push(new Surface({
            size: [80, 157],
            classes: ['plant', 'lower']
        }));
        this.plants.push(new Surface({
            size: [80, 157],
            classes: ['plant', 'upper']
        }));



        this.plant_lower_modifier = new Modifier({
            transform: Transform.translate(0,0,0)
        });

        this.pipeNodes[1].add(this.plant_lower_modifier).add(this.plants[1]);

    }//end create

    Pipe.prototype.restart = function(opts){
        var pipeSizeAndPos = _calcPipePositionAndSize.call(this);
        var upperPipe = pipeSizeAndPos[0];
        var lowerPipe = pipeSizeAndPos[1];

        //change the pipe number
        this.particles[0].pipeNumber = opts.id;

        //reset the pipes surface/particle size and position
        this.surfaces[0].size = [this.opts.pipeWidth, upperPipe.height];
        this.particles[0].setSize(this.surfaces[0].size);
        this.particles[0].setPosition([this.opts.initPipePos, upperPipe.y, -2]);

        this.surfaces[1].size = [this.opts.pipeWidth, lowerPipe.height];
        this.particles[1].setSize(this.surfaces[1].size);
        this.particles[1].setPosition([this.opts.initPipePos, lowerPipe.y, -2]);

    };


    function _calcGapOffset(){
        var gapHeight       = -100 + Math.random() * 300;
        var gapDirection    = (Math.random() * 100 % 2) == 0 ? -1: 1;
        return gapHeight * gapDirection;
    }

    function _calcPipePositionAndSize(){
        var gapOffset = _calcGapOffset();

        var upperPipeHeight = (this.opts.pipeHeight-200) + gapOffset;
        var lowerPipeHeight = (this.opts.pipeHeight-200) - gapOffset;
        var upperPipeYPos = upperPipeHeight/2;
        var lowerPipeYPos = 480 + gapOffset + lowerPipeHeight/2;

        return [
            {height: upperPipeHeight, y: upperPipeYPos},
            {height: lowerPipeHeight, y: lowerPipeYPos}
        ];
    }


	module.exports = Pipe;
});

