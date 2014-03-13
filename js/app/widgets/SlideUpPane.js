define(function(require, exports, module) {
	var Timer = require('famous-utils/Time');
	var AppUtils = require('app/Util');
	var Transform = require('famous/Transform');
	var Modifier = require('famous/Modifier');
    var Surface = require('famous/Surface');
	var ContainerSurface = require('famous-surfaces/ContainerSurface');
    var View = require("famous/View");
	
	//Transitions
    var Transitionable = require('famous-transitions/Transitionable');
    var SpringTransition = require('famous-transitions/SpringTransition')


    Transitionable.registerMethod('spring', SpringTransition);


	function SlideUpPane(node, options){
        View.apply(this, [options]);

		_create.call(this, node);
	};
    SlideUpPane.prototype = Object.create(View.prototype);
    SlideUpPane.prototype.constructor = SlideUpPane;
    SlideUpPane.DEFAULT_OPTIONS = {
        classes     : [],
        content     : null,
        visible     : false,
        origin      : [.5,.5],
        size        : [300,300]
    };

    function _create(node){
        this.surface = new ContainerSurface({
            size : this.options.size,
        });
        
        this.spring = {
            method: 'spring',
            period: 300,
            dampingRatio: .5
        };

        this.modifier = new Modifier({
                transform: Transform.translate(0,500,0),
                origin: [0.5, 0.5],
                opacity: 0
        });

        node.add(this.modifier).add(this.surface);


        this.surface.pipe(this._eventOutput);
        this.surface.add(new Modifier({origin:[.5,.5]})).add(new Surface({
            classes : ['unselectable'].concat(this.options.classes),
            content: this.options.content
        }));
    }//end create

    SlideUpPane.prototype.hide = function(){
    	this.modifier.setOpacity(0, {duration: 400});
        this.visible = false;
    };//end method

    SlideUpPane.prototype.show = function(){
    	this.modifier.setTransform(Transform.translate(0,-50,1), this.spring);
    	this.modifier.setOpacity(1, {duration:200});

    	this.visible = true;
    };//end method

    SlideUpPane.prototype.render = function(){
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

    module.exports = SlideUpPane;
});

