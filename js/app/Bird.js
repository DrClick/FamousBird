define(function(require, exports, module) {
    "use strict";

    //Includes Famous Repositories
    var Surface     = require("famous/core/Surface");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var View        = require("famous/core/View");
    var Timer       = require("famous/utilities/Timer");

    //Include Physics
    var Spring      = require("famous/physics/forces/Spring");     //spring effect
    var Circle      = require("famous/physics/bodies/Circle");

    //Utilities
    var GameSounds  = require("app/GameSounds");
    

    

   
    /** @constructor */
    function Birdie(physicsEngine, opts){
        View.apply(this);

        //DV: define physics engine outside, and return the necessary particles to add
        this.physicsEngine = physicsEngine;
        this.opts = {
            flapStrength        : .035,
            birdieRadius        : 25
        };
        if (opts){this.setOptions(opts);}

        _create.call(this);
        this.hangout();
    }
    Birdie.prototype = Object.create(View.prototype); 
    Birdie.prototype.constructor = Birdie; 


    function _create(){
        
        this.flyTimer = null;
        this.flyState = 0;
        this.started = false;


        this.rotationModifier = new Modifier({
            size:[.001,.001],
            origin: [.5,.5]
        });
        
        
        //Create a physical particle
        this.particle = new Circle({
            mass : 1,
            radius : this.opts.birdieRadius,
            position: [200,440,10],
            velocity : [0,0,0]
        });
        this.particle.name = "Birdie Particle";
        this.physicsEngine.addBody(this.particle);

        //create the birdie surface
        this.birdieModifier = [];
        for (var i = 0; i < 3; i++) {
            this.birdieModifier.push(new Modifier({ opacity: 1, origin: [.5,.5]}));
        }

        var birdieContainer = new ContainerSurface({
            size: [77,57]
        });
        
        birdieContainer.add(this.birdieModifier[0]).add(new Surface({
            size : [77, 57],
            classes : ["birdie"]
        }));
        birdieContainer.add(this.birdieModifier[1]).add(new Surface({
            size : [77, 57],
            classes : ["birdie-up"]
        }));
        birdieContainer.add(this.birdieModifier[2]).add(new Surface({
            size : [77, 57],
            classes : ["birdie-down"]
        }));

        this._add(this.particle).add(this.rotationModifier).add(birdieContainer);
    }



    Birdie.prototype.setOptions = function(opts){
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


        this.flyTimer = Timer.setInterval(function(){this.fly();}.bind(this),100);

    };

    Birdie.prototype.fly = function(){
        this.flyState++;
        var state = this.flyState % 3;
        this.birdieModifier.forEach(function(b){
            b.setOpacity(.001);
        });
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

    Birdie.prototype.halt = function(){
        this.particle.setVelocity([0,0,0]);
        this.particle.setMass(0);
    }
    
    Birdie.prototype.flap = function(isInitialFlap){
        //this.particle.applyImpulse(new Vector([0,-.60,0]));
        this.particle.setVelocity([0,-.52,0]);
        
        //adjust the birdie rotation
        this.rotateBirdie("up");
        Timer.setTimeout(function(){
            this.rotateBirdie("down");
        }.bind(this), 100);
        GameSounds.playSound(0, 1.0);
    };

    Birdie.prototype.rotateBirdie = function(direction, callback) {
       var rotation = (direction === "up" ? Math.PI * -0.25 : Math.PI * .5);
       var duration = (direction === "up" ? 100 : 800);
       this.rotationModifier.halt();
       this.rotationModifier.setTransform(Transform.rotateZ(rotation), { duration: duration, curve: "easeIn" }, callback);
    };

    module.exports = Birdie;
});
