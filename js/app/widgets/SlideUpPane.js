define(function(require, exports, module) {
	var Timer = require('famous-utils/Time');
	var AppUtils = require('app/Util');
	var Matrix = require('famous/Matrix');
	var Modifier = require('famous/Modifier');
    var Surface = require('famous/Surface');
	var ContainerSurface = require('famous/ContainerSurface');
	
	//Transitions
    var Transitionable = require('famous/Transitionable');
    var SpringTransition = require('famous-physics/utils/SpringTransition')


    Transitionable.registerMethod('spring', SpringTransition);


	function SlideUpPane(view, opts){
		this.opts = {
			classes 	: [],
			content 	: null,
			visible 	: false,
			origin		: [.5,.5],
			size		: [300,300]
		};
		if (opts) this.setOpts(opts);


		this.surface = new ContainerSurface({
			size : this.opts.size,
		});
		
		this.spring = {
            method: 'spring',
            period: 300,
            dampingRatio: .5
        };


        this.modifier = new Modifier({
        		transform: Matrix.translate(0,500,0),
        		origin: [0.5, 0.5],
                opacity: 0
        });

        view._add(this.modifier).link(this.surface);


        this.surface.add(new Modifier({origin:[.5,.5]})).link(new Surface({
            classes : ['unselectable'].concat(this.opts.classes),
            content: this.opts.content
        }));

	};

	SlideUpPane.prototype.setOpts = function(opts){
		for (var key in opts) this.opts[key] = opts[key];
    };//end method


    SlideUpPane.prototype.hide = function(){
    	this.modifier.setOpacity(0, {duration: 400});
        this.visible = false;
    };//end method

    SlideUpPane.prototype.show = function(){
    	this.modifier.setTransform(Matrix.translate(0,-50,0), this.spring);
    	this.modifier.setOpacity(1, {duration:200});

    	this.visible = true;
    };//end method

    SlideUpPane.prototype.render = function(){
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

    module.exports = SlideUpPane;
});

