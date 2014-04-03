    define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');

    var Modifier = require("famous/core/Modifier");
    var Transform = require("famous/core/Transform");
    var Circle = require("famous/physics/bodies/Circle");
    var View = require("famous/core/View");

    var AppUtils = require('app/Util');

      
    /** @constructor */
    function Score(options){
        View.apply(this, [options]);
        
        _create.call(this);
    };
    Score.prototype = Object.create(View.prototype); 
    Score.prototype.constructor = Score; 

    function _create(){
        this.score      = 0;
        this.surface    = null;
        this.particle   = null;
        this.visible    = true;
        this.classes    = ['scorer'].concat(this.options.classes);
    }


    Score.prototype.attachToPhysics = function(physicsEngine){
    	//add the point to the screen so that it will score
        
        this.surface = 
            new Surface({
                size : [100,25],
                classes : this.classes,
                content: '<h1>0</h1>'
            });

        
        this.modifier = new Modifier({
            transform: Transform.translate(280, 10, 10),
            origin: [.5,.5]
        }); 


	    //Create a physical particle. This will be used when a pipe overlaps this particle, 
        //the player will have scored
        this.particle = new Circle({
                    mass: 0,
                    radius: 5,
                    position : [50, 0 , 0],
                    velocity : [0,0,0]
                });

        //Render the Famous Surface from the particle. Note we did not need to link in the surface
        //here because we have created a custom render method on this.modifier
        this._add(this.particle).add(this.modifier).add(this.surface)
    };

    Score.prototype.setScore = function(score){
        this.surface.setContent("<h1>" + score + "</h1>");
        AppUtils.pulse(this.modifier);
    };

    Score.prototype.show = function(score){
        this.visible = true;
    };

    Score.prototype.hide = function(score){
        this.visible = false;
    };

    Score.prototype.render = function render(){
        return this.visible ? this._node.render() : [];
    }


	module.exports = Score;
});

