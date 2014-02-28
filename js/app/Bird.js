define(function(require, exports, module) {
    "use strict";

    //Includes Famous Repositories
    var Surface = require("famous/Surface");
    var Modifier = require("famous/Modifier");
    var Matrix = require("famous/Matrix");
    var Vector = require("famous-physics/math/Vector");

    //Include Physics
    var Spring = require("famous-physics/forces/Spring");     //spring effect

    //Utilities
    var AppUtils = require("app/Util");
    var Sounds = require("app/Sounds");
    var Timer = require("famous-utils/Time");

   
    /** @constructor */
    function Birdie(physicsEngine, opts){

        this.opts = {
            flapStrength        : .035,
            birdieRadius        : 28
        };
        if (opts){this.setOpts(opts);}

        this.physicsEngine = physicsEngine;
        this.flyTimer = null;
        this.flyState = 0;
        this.started = false;
        
        //create surface
        this.surface = new Surface({
            size : [78, 57],
            classes : ["birdie"]
        });

        this.modifier = new Modifier({
            transform: Matrix.rotateZ(0),
            origin: [0.5, 0.5]
        });

        //Create a physical particle
        this.particle = this.physicsEngine.createBody({
            shape : this.physicsEngine.BODIES.CIRCLE,
            m : 1,
            r : this.opts.birdieRadius,
            p : [-120,-40,10],
            v : [0,0,0]
        });


        //Render the Famous Surface from the particle
        this.particle.link(this.modifier).link(this.surface);

        this.hangout();
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
            anchor          : [-120,-20,0]
        });

        this.springID = this.physicsEngine.attach(spring, this.particle);
        var me = this;
        this.flyTimer = Timer.setInterval(function(){me.fly();},150);


    };

    Birdie.prototype.fly = function(){
        this.flyState++;
        var state = this.flyState % 4;
        if(state === 0 || state === 2 ) {this.surface.setClasses(["birdie"]);}
        if(state === 1) {this.surface.setClasses(["birdie", "birdie-up"]);}
        if(state === 3) {this.surface.setClasses(["birdie","birdie-down"]);}
    };

    Birdie.prototype.start = function() {
        if(!this.started){
            this.started = true;
            this.physicsEngine.detach(this.springID);
        }

        this.flap(true);
    };

    Birdie.prototype.stop = function() {
        Timer.removeInterval(this.flyTimer);
    };
    
    Birdie.prototype.flap = function(isInitialFlap){
        var me = this;

        console.log("flap");

        if(!isInitialFlap){
            //nudge the bird up
            this.particle.setVel([0,-.45,0]);//this was a hack, but it works better than below
        }
        else{
            this.particle.applyForce({x : 0, y : -this.opts.flapStrength, z : 0});
        }
        
        //adjust the birdie rotation
        this.rotateBirdie("up", function(){
            me.rotateBirdie("down");}
        );
        AppUtils.playSound("flap");
    };

    Birdie.prototype.rotateBirdie = function(direction, callback) {
       var rotation = (direction === "up" ? Math.PI * -0.25 : Math.PI * .5);
       var duration = (direction === "up" ? 100 : 800);
       this.modifier.halt();
       this.modifier.setTransform(Matrix.rotateZ(rotation), { duration: duration }, callback);
    };

    module.exports = Birdie;
});