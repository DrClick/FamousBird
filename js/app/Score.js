define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Engine = require('famous/Engine');
    var Surface = require('famous/Surface');

    var Modifier = require("famous/Modifier");
    var Transform = require("famous/Transform");

    var AppUtils = require('app/Util');

      
    /** @constructor */
    function Score(){
        this.score      = 0;
        this.surface    = null;
        this.particle   = null;
        this.visible    = true;
    };

    Score.prototype.attachToPhysics = function(physicsEngine){
    	//add the point to the screen so that it will score
        
        this.surface = 
            new Surface({
                size : [100,25],
                classes : ['scorer'],
                content: '<h1>0</h1>'
            });

        //NOTE: we need two transforms here, one to translate from the particle position
        //and one to scale the score (used in pulsing it)
        this.translateModifier = new Modifier({
            transform: Transform.translate(230, 20, 60)
        }); 
        

        //create a modifier with a custom render method so we can 
        //interact with this modifier programatically. Specifically
        //we want to be able to hide this. 
        this.modifier = new Modifier({
            transform: Transform.scale(1, 1, 0)
        });

        this.modifier.render = function(){
            if(this.visible){
                return {
                    transform : this.modifier.getTransform(),
                    target : this.surface.render(),
                    origin : this.modifier.getOrigin(),
                    opacity : this.modifier.getOpacity()
                };
            }//end if visible
        }.bind(this);


	    //Create a physical particle. This will be used when a pipe overlaps this particle, 
        //the player will have scored
        this.particle = physicsEngine.createBody({
                    shape : physicsEngine.BODIES.CIRCLE,
                    m : 0,
                    r: 5,
                    p : [-230, -450 , 0],
                    v : [0,0,0]
                });

        //Render the Famous Surface from the particle. Note we did not need to link in the surface
        //here because we have created a custom render method on this.modifier
        this.particle.add(this.translateModifier).add(this.modifier);
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


	module.exports = Score;
});

