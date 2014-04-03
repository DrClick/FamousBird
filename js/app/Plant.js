define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Surface     = require("famous/core/Surface");
    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var View        = require("famous/core/View");
    var Rectangle   = require("famous/physics/bodies/Rectangle");
    var Timer       = require("famous/utilities/Timer");
    var Spring      = require("famous/physics/forces/spring");

      
    /** @constructor */
    function Plant(physicsEngine, options){
        View.apply(this, [options]);
        this.physicsEngine = physicsEngine;

        _create.call(this);
    }
    Plant.prototype = Object.create(View.prototype); 
    Plant.prototype.constructor = Plant;
    Plant.DEFAULT_OPTIONS = {
        size: [80, 157],
        visible: true
    };

  
    function _create(){
        var yPos = _getYPos.call(this, this.options.pipeHeight);

	    //add the Plant off screen
        this.surface = new Surface({
            size: this.options.size,
            classes: ['plant', this.options.type]
        })

	    //Create a physical particle
        this.particle = new Rectangle({
            mass : 1,
            size: this.options.size,
            position : [0, yPos, -1]
        });

        this.spring = new Spring({
            period          : 1000,
            dampingRatio    : 1,
            length          : this.options.size[1],
            forceFunction   : Spring.FORCE_FUNCTIONS.FENE,
            anchor          : [0, yPos, 0]
        });


        //attach the paricles and surface
        this.physicsEngine.addBody(this.particle);
        this.springID = this.physicsEngine.attach(this.spring, this.particle);


        this.add(this.particle).add(this.surface);

        this.surface.pipe(this._eventOutput);
        this.visible = this.options.visible;
    }

    function _getYPos(pipeHeight){
        if(this.options.type == "lower"){
            return -pipeHeight/2 +  157/2 + 1;
        }
        else{
            return pipeHeight/2 - 157/2 - 1;
        }
    }

    Plant.prototype.restart = function(pipeHeight){
        var yPos = _getYPos.call(this, pipeHeight);
        this.spring.setAnchor([0,yPos,0]);
        this.particle.setPosition([0, yPos, -1]);
    };


    Plant.prototype.hide = function(){
        //go back in the pipe
        var direction = this.options.type == "lower" ? 1 : -1;
        this.spring.setAnchor([0,157 * direction,0]);
        this.particle.setVelocity([0, direction * .8], 0);

        Timer.setTimeout(function(){
            this.visible = false;
        }.bind(this), 1300);
        
    };//end show
    Plant.prototype.show = function(){
        this.visible = true;

        //come out of the pipe
        var direction = this.options.type == "lower" ? -1 : 1;
        this.particle.setVelocity([0, direction * .2], 0);

    };//end show

    Plant.prototype.attack = function(){
        this.show();
        Timer.setTimeout(_fire.bind(this), 1000);
        Timer.setTimeout(this.hide.bind(this), 1300);
    };//end show

    function _fire(){
        console.log("fire");
    }

    Plant.prototype.render = function(){
        return this.visible ? this._node.render() : undefined;
    };//end render


	module.exports = Plant;
});

