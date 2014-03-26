define(function(require, exports, module) {
    "use strict";

    //Includes Famous Repositories
    var Surface     = require("famous/core/Surface");
    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var Vector      = require("famous/math/Vector");
    var View        = require("famous/core/View");
    var Timer       = require("famous/utilities/Timer");

    //Include Physics
    var Spring      = require("famous/physics/forces/Spring");     //spring effect
    var Circle      = require("famous/physics/bodies/Circle");

    //Utilities
    var AppUtils    = require("app/Util");
    var GameSounds  = require("app/GameSounds");
    

    

   
    /** @constructor */
    function Birdie(physicsEngine, opts){
        View.apply(this);

        this.physicsEngine = physicsEngine;
        this.opts = {
            flapStrength        : .035,
            birdieRadius        : 25
        };
        if (opts){this.setOpts(opts);}

        _create.call(this);
        this.hangout();
    }
    Birdie.prototype = Object.create(View.prototype); 
    Birdie.prototype.constructor = Birdie; 


    function _create(){
        
        this.flyTimer = null;
        this.flyState = 0;
        this.started = false;
        
        this.birdieModifier = [];

        this.birdieModifier.push(new Modifier({ opacity: 1}));
        this.birdieModifier.push(new Modifier({ opacity: 1}));
        this.birdieModifier.push(new Modifier({ opacity: 1}));

        //Create a physical particle
        this.particle = new Circle({
            mass : 1,
            radius : this.opts.birdieRadius,
            position: [200,440,10],
            velocity : [0,0,0]
        });
        this.particle.name = "Birdie Particle";


        this.physicsEngine.addBody(this.particle);

        //Render the Famous Surface from the particle
        this._add(this.birdieModifier[0]).add(new Surface({
            size : [77, 57],
            classes : ["birdie"]
        }));
        this._add(this.birdieModifier[1]).add(new Surface({
            size : [77, 57],
            classes : ["birdie-up"]
        }));
        this._add(this.birdieModifier[2]).add(new Surface({
            size : [77, 57],
            classes : ["birdie-down"]
        }));
    }



    Birdie.prototype.setOpts = function(opts){
        for (var key in opts){this.opts[key] = opts[key];}
    };


    Birdie.prototype.hangout = function(){
        //Define Physical Agents: Forces & constraints
        var spring = new Spring({
            period          : 1200,
            dampingRatio    : 0,
            length          : 30,
            bidirectional   : true,
            anchor          : [200,400,10]
        });

        this.springID = this.physicsEngine.attach(spring, this.particle);


        this.flyTimer = Timer.setInterval(function(){this.fly()}.bind(this),100);

    };

    Birdie.prototype.fly = function(){
        this.flyState++;
        var state = this.flyState % 3;
        this.birdieModifier.forEach(function(b){
            b.setOpacity(.001)});
        this.birdieModifier[state].setOpacity(.999);
    };

    Birdie.prototype.start = function() {
        if(!this.started){
            this.started = true;
            this.physicsEngine.detach(this.springID);
        }

        this.flap(true);
    };

    Birdie.prototype.stop = function() {
        Timer.clear(this.flyTimer);
    };
    
    Birdie.prototype.flap = function(isInitialFlap){
        if(!isInitialFlap){
            //nudge the bird up
            this.particle.setVel([0,-.50,0]);//this was a hack, but it works better than below
        }
        else{
            this.particle.applyForce({x : 0, y : -this.opts.flapStrength, z : 0});
        }
        
        //adjust the birdie rotation
        this.rotateBirdie("up");
        Timer.setTimeout(function(){this.rotateBirdie("down")}.bind(this), 100)
        GameSounds.playSound(0, 1.0);
    };

    Birdie.prototype.rotateBirdie = function(direction, callback) {
       var rotation = (direction === "up" ? Math.PI * -0.25 : Math.PI * .5);
       var duration = (direction === "up" ? 100 : 800);
       this.modifier.halt();
       this.modifier.setTransform(Transform.rotateZ(rotation), { duration: duration }, callback);
    };

    module.exports = Birdie;
});
