define(function(require, exports, module) {
	var Timer = require('famous-utils/Time');
	var AppUtils = require('app/Util');
	var Matrix = require('famous/Matrix');
	var Modifier = require('famous/Modifier');
	var Surface = require('famous/Surface');
	var View = require("famous/View");

	//Physics
	var PhysicsEngine = require('famous-physics/PhysicsEngine');
	var Spring = require('famous-physics/constraints/StiffSpring');


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
        this.particle = this.physicsEngine.createBody({
            shape : this.physicsEngine.BODIES.CIRCLE,
            m : 1,
            r : 1,
            p : [0,-180,0],
            v : [0,1,0]
        });

        this.spring = new Spring({
            period          : 200,
            dampingRatio    : .2,
            length          : 100,
            bidirectional   : false,
            anchor          : [0,-0,0]
        });

        this.modifier = new Modifier({
                transform: Matrix.translate(0,0,50),
                origin: [0.5, 0.5]
            }
        );

        this.springID = this.physicsEngine.attach(this.spring, this.particle);
        this.particle.link(this.modifier).link(this.surface);
    }//end create

	BouncyPane.prototype.pulse = function(){
		this.particle.setVel(0,2,0);
    };//end method

    BouncyPane.prototype.hide = function(){
    	this.modifier.setTransform(Matrix.translate(0,-500,0), {duration: 800},
    		function(){
    			this.visible = false;
    	}.bind(this));
    	this.modifier.setOpacity(0, {duration: 400});
    };//end method

    BouncyPane.prototype.show = function(){
    	this.modifier.setTransform(Matrix.translate(0,-100,10));
    	this.modifier.setOpacity(1);

    	this.visible = true;
    	this.pulse();
    };//end method

    BouncyPane.prototype.render = function(){
        var spec = [];
        // return startupSurface.render();
        if(this.visible){
        	spec.push({
        		transform : this.modifier.getTransform(),
        		target : this.surface.render(),
        		origin : this.modifier.getOrigin(),
        		opacity : this.modifier.getOpacity()
        	});
        }//end if visible

        return spec;
    };//end method

    module.exports = BouncyPane;
});

