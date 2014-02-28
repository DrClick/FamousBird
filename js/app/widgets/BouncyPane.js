define(function(require, exports, module) {
	var Timer = require('famous-utils/Time');
	var AppUtils = require('app/Util');
	var Matrix = require('famous/Matrix');
	var Modifier = require('famous/Modifier');
	var Surface = require('famous/Surface');
	
	//Physics
	var PhysicsEngine = require('famous-physics/PhysicsEngine');
	var Spring = require('famous-physics/constraints/StiffSpring');


	function BouncyPane(physicsEngine, opts){
		this.opts = {
			classes 	: [],
			content 	: null,
			visible 	: false,
			origin		: [.5,.5],
			size		: [300,300]
		};
		if (opts) this.setOpts(opts);


		this.surface = new Surface({
			size : this.opts.size,
			classes : ['unselectable'].concat(this.opts.classes),
			content: this.opts.content
		});
		
		//Create a physical particle
        this.particle = physicsEngine.createBody({
            shape : physicsEngine.BODIES.CIRCLE,
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

        this.springID = physicsEngine.attach(this.spring, this.particle);
        this.particle.link(this.modifier).link(this.surface);
	}

	BouncyPane.prototype.setOpts = function(opts){
		for (var key in opts) this.opts[key] = opts[key];
    };//end method


	BouncyPane.prototype.pulse = function(){
		this.particle.setVel(0,2,0);
    };//end method

    BouncyPane.prototype.hide = function(){
    	var me = this;
    	this.modifier.setTransform(Matrix.translate(0,-500,0), {duration: 800},
    		function(){
    			me.visible = false;
    	});
    	this.modifier.setOpacity(0, {duration: 400});
    };//end method

    BouncyPane.prototype.show = function(){
    	this.modifier.setTransform(Matrix.translate(0,-100,0));
    	this.modifier.setOpacity(1);

    	this.visible = true;
    	this.pulse();
    };//end method

    BouncyPane.prototype.render = function(){
        // return startupSurface.render();
        if(this.visible){
        	return {
        		transform : this.modifier.getTransform(),
        		target : this.surface.render(),
        		origin : this.modifier.getOrigin(),
        		opacity : this.modifier.getOpacity()
        	};
        }//end if visible
    };//end method

    module.exports = BouncyPane;
});

