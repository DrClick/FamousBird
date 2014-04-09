define(function(require, exports, module) {
    "use strict";

    //Includes Famous Repositories
    var Surface     = require("famous/core/Surface");
    var RenderNode  = require("famous/core/RenderNode");
    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var View        = require("famous/core/View");
    var Timer       = require("famous/utilities/Timer");

    //Include Physics
    var Spring      = require("famous/physics/forces/Spring");     //spring effect
    var Circle      = require("famous/physics/bodies/Circle");

    //Utilities
    var GameSounds              = require("app/GameSounds");
    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");
    

    

   
    /** @constructor */
    function Birdie(options){
        View.apply(this, options);

        _create.call(this);
        _init.call(this);
    }
    Birdie.prototype = Object.create(View.prototype); 
    Birdie.prototype.constructor = Birdie; 
    Birdie.DEFAULT_OPTIONS = {
        flapStrength        : .035,
        birdieRadius        : 25
    };

    function _create(){
        this.physicsEngine = PhysicsEngineFactory.getEngine();
        
        this.flyState = 0;

        this.rotationModifier = new Modifier({
            size:[.001,.001],
            origin: [.5,.5]
        });
        
        
        //Create a physical particle
        this.particle = new Circle({
            mass : 1,
            radius : this.options.birdieRadius,
            position: [200,440,10],
            velocity : [0,0,0]
        });
        this.particle.name = "Birdie Particle";
        this.physicsEngine.addBody(this.particle);


        //since we need to modify the opacity of each of the three birdie surfaces, we will need 
        //modifiers for each.
        this.birdieModifier = [];
        var birdieNode = new RenderNode();
        
        ["middle", "up", "down"].forEach(function(flapState, index){
            //create a modifier
            this.birdieModifier.push(new Modifier({ opacity: 1, origin: [.5,.5]}));
            //add a surface to the render node
            birdieNode.add(this.birdieModifier[index]).add(new Surface({
                size : [77, 57],
                classes : ["birdie" + "-" + flapState]
            }));
        }.bind(this));

        this._add(this.particle).add(this.rotationModifier).add(birdieNode);
    }

    function _init(){
        this.hangout();
        this.flyTimer = Timer.setInterval(function(){this.fly();}.bind(this),100);
    }


    Birdie.prototype.hangout = function(){
        //Create a new spring force
        var spring = new Spring({
            period          : 1200,
            dampingRatio    : 0, //undamped, we want the bird to bounce until we start
            length          : 30,
            bidirectional   : true,
            anchor          : [200,400,10] //notice this positioned above where we set the birdie
        });

        //when we attach forces to particles, we get the ID back, this is useful for when you want 
        //to detach this force later (for instance when we start the game)
        this.springID = this.physicsEngine.attach(spring, this.particle);
    };

    Birdie.prototype.fly = function(){
        this.flyState++;
        var state = this.flyState % 3;
        
        //set the opacity of all the birdie surface modifiers
        this.birdieModifier.forEach(function(modifier, index){
            modifier.setOpacity(index == state ? 1 : .001);
        });
    };

    Birdie.prototype.start = function() {
        //remove the spring
        this.physicsEngine.detach(this.springID);
        //gives the birdie an initial upward motion
        this.flap();
    };

    Birdie.prototype.stop = function() {
        Timer.clear(this.flyTimer);
    };

    Birdie.prototype.halt = function(){
        this.particle.setVelocity([0,0,0]);
        this.particle.setMass(0);
    }
    
    Birdie.prototype.flap = function(){
        this.particle.setVelocity([0,-.52,0]);
        
        //adjust the birdie rotation
        this.rotateBirdie("up");
        Timer.setTimeout(function(){
            this.rotateBirdie("down");
        }.bind(this), 100);
        GameSounds().playSound(0, 1.0);
    };

    Birdie.prototype.rotateBirdie = function(direction, callback) {
       var rotation = (direction === "up" ? Math.PI * -0.25 : Math.PI * .5);
       var duration = (direction === "up" ? 100 : 800);
       this.rotationModifier.halt();
       this.rotationModifier.setTransform(Transform.rotateZ(rotation), { duration: duration, curve: "easeIn" }, callback);
    };

    module.exports = Birdie;
});