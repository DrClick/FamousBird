define(function(require, exports, module) {
	var AppUtils   = require('app/Util');
	var Transform  = require('famous/core/Transform');
	var Modifier   = require('famous/core/Modifier');
	var Surface    = require('famous/core/Surface');
	var View       = require("famous/core/View");

	//Physics
	var PhysicsEngine   = require('famous/physics/PhysicsEngine');
	var Spring          = require('famous/physics/constraints/Snap');
    var Circle          = require("famous/physics/bodies/Circle");

    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");


    function BouncyPane(options){
        View.apply(this, arguments);

        _create.call(this);
    }
    BouncyPane.prototype = Object.create(View.prototype);
    BouncyPane.prototype.constructor = BouncyPane;
    BouncyPane.DEFAULT_OPTIONS = {
        classes     : [],
        content     : null,
        visible     : false,
        size        : [300,300]
    };


    function _create(){
        this.physicsEngine = PhysicsEngineFactory.getEngine();
        
        this.surface = new Surface({
            size : this.options.size,
            classes : ['unselectable'].concat(this.options.classes),
            content: this.options.content
        });
        
        //Create a physical particle
        this.particle = new Circle({
            mass : 1,
            radius : 1,
            position : [320,0,10],
            velocity : [0,1,0]
        });

        this.spring = new Spring({
            period          : 200,
            dampingRatio    : .2,
            length          : 100,
            origin          : [.5,.5],
            bidirectional   : false,
            anchor          : [320,200,0]
        });
        //attach physics
        this.physicsEngine.addBody(this.particle);
        this.springID = this.physicsEngine.attach(this.spring, this.particle);


        //setup the surface
        this.modifier = new Modifier({origin: [.5, .5]});
        this._add(this.particle).add(this.modifier).add(this.surface);
    }//end create

	BouncyPane.prototype.pulse = function(){
		this.particle.setVelocity([0,1,0]);
    };//end method


    BouncyPane.prototype.hide = function(){
    	this.modifier.setTransform(Transform.translate(0,-100,10), {duration: 800},
    		function(){
    			this.visible = false;
    	}.bind(this));
    	this.modifier.setOpacity(0, {duration: 400});
    };//end method


    BouncyPane.prototype.show = function(){
        this.visible = true;
    	this.modifier.setTransform(Transform.translate(0,200,10));
    	this.modifier.setOpacity(1);

    	this.pulse();
    };//end method

    BouncyPane.prototype.render = function render(){
        return this.visible ? this._node.render() : [];
    }


    module.exports = BouncyPane;
});

