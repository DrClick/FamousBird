define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Engine      = require('famous/core/Engine');
    var Surface     = require('famous/core/Surface');
    var RenderNode  = require("famous/core/RenderNode");

    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var View        = require("famous/core/View");
    var Rectangle   = require("famous/physics/bodies/Rectangle");

    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");
    var Plant                   = require("app/Plant");

      
    /** @constructor */
    function Pipe(options){
        View.apply(this, arguments);

        _create.call(this);
    };
    Pipe.prototype = Object.create(View.prototype); 
    Pipe.prototype.constructor = Pipe;
    Pipe.DEFAULT_OPTIONS = {
        velocity        : -.3,
        pipeHeight      : 480,
        pipeWidth       : 113,
        initPipePos     : 700
    };

    function _create(){
        this.physicsEngine = PhysicsEngineFactory.getEngine();
    
        var pipeSizeAndPos = _calcPipePositionAndSize.call(this);
        var upperPipe = pipeSizeAndPos[0];
        var lowerPipe = pipeSizeAndPos[1];

	    

        this.surfaces = [
            new Surface({
                size : [this.options.pipeWidth, upperPipe.height],
                classes : ['pipe','upper', 'unselectable']
            }),
            new Surface({
                size : [this.options.pipeWidth, lowerPipe.height],
                classes : ['pipe','lower']
            })
        ];


        this.particles = 
            [
                //upper pipe
                new Rectangle({
                    mass: 0,
                    size : [this.options.pipeWidth, upperPipe.height],
                    position : [this.options.initPipePos, upperPipe.y, -2],
                    velocity : [this.options.velocity,0,0]
                }),
                //lower pipe
                new Rectangle({
                    mass : 0,
                    size : [this.options.pipeWidth, lowerPipe.height],
                    position : [this.options.initPipePos, lowerPipe.y, -2],
                    velocity : [this.options.velocity,0,0]
                })
            ];

        //set a property on the pipe used for scoring
        this.particles[0].pipeNumber = this.options.id;


        //create render nodes for the pipes
        this.pipeNodes = {};
        this.pipeNodes["upper"] = new RenderNode();
        this.pipeNodes["lower"] = new RenderNode();

        this.pipeNodes["upper"].add(this.surfaces[0]);
        this.pipeNodes["lower"].add(this.surfaces[1]);

        //add the particles as modifiers
        //NOTE: It is important to add the origin modifier after adding the particle so that the
        //particle is in the middle of the surface
        this._add(this.particles[0])
            .add(new Modifier({origin:[.5,.5]}))
            .add(this.pipeNodes["upper"]);
        this._add(this.particles[1])
            .add(new Modifier({origin:[.5,.5]}))
            .add(this.pipeNodes["lower"]);


        //add the particles to the physics engine
        this.physicsEngine.addBody(this.particles[0]);
        this.physicsEngine.addBody(this.particles[1]);

        //pipe events so clicks on the pipes will bubble up 
        this.surfaces[0].pipe(this._eventOutput);
        this.surfaces[1].pipe(this._eventOutput);



        //add the plants
        this.plants = {};
        this.plants["upper"] = new Plant({
            pipeHeight: upperPipe.height, 
            type: "upper",
            particle: this.particles[0]
        });
        this.plants["lower"] = new Plant({
            pipeHeight: lowerPipe.height, 
            type: "lower",
            particle: this.particles[1]
        });

        this.pipeNodes["upper"].add(this.plants["upper"]);
        this.pipeNodes["lower"].add(this.plants["lower"]);

        this.plants["upper"].pipe(this._eventOutput);
        this.plants["lower"].pipe(this._eventOutput);


        _attack.call(this)

    }//end create

    Pipe.prototype.restart = function(opts){
        var pipeSizeAndPos = _calcPipePositionAndSize.call(this);
        var upperPipe = pipeSizeAndPos[0];
        var lowerPipe = pipeSizeAndPos[1];

        //change the pipe number
        this.particles[0].pipeNumber = opts.id;

        //reset the pipes surface/particle size and position
        this.surfaces[0].size = [this.options.pipeWidth, upperPipe.height];
        this.particles[0].setSize(this.surfaces[0].size);
        this.particles[0].setPosition([this.options.initPipePos, upperPipe.y, -2]);

        this.surfaces[1].size = [this.options.pipeWidth, lowerPipe.height];
        this.particles[1].setSize(this.surfaces[1].size);
        this.particles[1].setPosition([this.options.initPipePos, lowerPipe.y, -2]);

        this.plants["upper"].restart(upperPipe.height);
        this.plants["lower"].restart(lowerPipe.height);
        _attack.call(this)

    };

    function _attack(){
        //reset the plants
        var threshold = 1;//a value of 1 turns off the plant attacks to start
        
        var currentPipe = this.particles[0].pipeNumber;

        //set the threshold 
        if (currentPipe > 6) {threshold = .8};
        if (currentPipe > 20) {threshold = .6};
        if (currentPipe > 50) {threshold = .4};
        if (currentPipe > 100) {threshold = .2};

        if(Math.random() > threshold) {this.plants["upper"].attack();}
        if(Math.random() > threshold) {this.plants["lower"].attack();}
    }


    function _calcGapOffset(){
        var gapHeight       = -100 + Math.random() * 300;
        var gapDirection    = (Math.random() * 100 % 2) == 0 ? -1: 1;
        return gapHeight * gapDirection;
    }

    function _calcPipePositionAndSize(){
        var gapOffset = _calcGapOffset();

        var upperPipeHeight = (this.options.pipeHeight-200) + gapOffset;
        var lowerPipeHeight = (this.options.pipeHeight-200) - gapOffset;
        var upperPipeYPos = upperPipeHeight/2;
        var lowerPipeYPos = 480 + gapOffset + lowerPipeHeight/2;

        return [
            {height: upperPipeHeight, y: upperPipeYPos},
            {height: lowerPipeHeight, y: lowerPipeYPos}
        ];
    }


	module.exports = Pipe;
});

