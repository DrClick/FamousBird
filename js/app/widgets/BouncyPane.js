define(function(require, exports, module) {
	var AppUtils = require('app/Util');
	var Transform = require('famous/core/Transform');
	var Modifier = require('famous/core/Modifier');
	var Surface = require('famous/core/Surface');
	var View = require("famous/core/View");

	//Physics
	var PhysicsEngine   = require('famous/physics/PhysicsEngine');
	var Spring          = require('famous/physics/constraints/Snap');
    var Circle          = require("famous/physics/bodies/Circle");


	function BouncyPane(physicsEngine, options){
        View.apply(this, [options]);

        this.physicsEngine = physicsEngine;
		_create.call(this);
	}
    BouncyPane.prototype = Object.create(View.prototype);
    BouncyPane.prototype.constructor = BouncyPane;
    BouncyPane.DEFAULT_OPTIONS = {
        classes     : [],
        content     : null,
        visible     : false,
        origin      : [.5,.5],
        size        : [300,300]
    };


    function _create(){
        this.surface = new Surface({
            size : this.options.size,
            classes : ['unselectable'].concat(this.options.classes),
            content: this.options.content
        });
        
        //Create a physical particle
        this.particle = new Circle({
            mass : 1,
            radius : 1,
            position : [270,-100,10],
            velocity : [0,1,0]
        });

        this.spring = new Spring({
            period          : 200,
            dampingRatio    : .2,
            length          : 100,
            bidirectional   : false,
            anchor          : [270,200,0]
        });

        this.modifier = new Modifier({
                origin: [0.5, 0.5]
            }
        );

        this.physicsEngine.addBody(this.particle);
        this.springID = this.physicsEngine.attach(this.spring, this.particle);
        this._add(this.particle).add(this.modifier).add(this.surface);
    }//end create

	BouncyPane.prototype.pulse = function(){
		this.particle.setVelocity([0,1,0]);
    };//end method


    BouncyPane.prototype.hide = function(){
    	this.modifier.setTransform(Transform.translate(320,-100,10), {duration: 800},
    		function(){
    			this.visible = false;
    	}.bind(this));
    	this.modifier.setOpacity(0, {duration: 400});
    };//end method


    BouncyPane.prototype.show = function(){
    	this.modifier.setTransform(Transform.translate(0,200,10));
    	this.modifier.setOpacity(1);

    	this.visible = true;
    	this.pulse();
    };//end method


    module.exports = BouncyPane;
});

