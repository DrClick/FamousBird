define(function(require, exports, module) {
	var AppUtils           = require('app/Util');
	var Transform          = require('famous/core/Transform');
	var Modifier           = require('famous/core/Modifier');
    var Surface            = require('famous/core/Surface');
	var ContainerSurface   = require('famous/surfaces/ContainerSurface');
    var View               = require("famous/core/View");
    var Timer              = require("famous/utilities/Timer");
	
	//Transitions
    var Transitionable     = require('famous/transitions/Transitionable');
    var SpringTransition   = require('famous/transitions/SpringTransition')


    Transitionable.registerMethod('spring', SpringTransition);


	function SlideUpPane(options){
        View.apply(this, [options]);

		_create.call(this);
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

    function _create(){
        this.surface = new ContainerSurface();
        
        this.spring = {
            method: 'spring',
            period: 300,
            dampingRatio: .5
        };

        this.modifier = new Modifier({
                transform: Transform.translate(320,1000,20),
                origin: [0.5, 0.5],
                opacity: 0
        });

        //node.add(this.modifier).add(this.surface);


        this.surface.pipe(this._eventOutput);
        this.surface
            .add(new Modifier({origin:[.5,.5]}))
            .add(new Surface({
                classes : ['unselectable'].concat(this.options.classes),
                size: this.options.size,
                content: this.options.content
            }));

        this.add(this.modifier).add(this.surface);
    }//end create

    SlideUpPane.prototype.hide = function(){
    	this.modifier.setOpacity(0, {duration: 400});
        this.visible = false;
    };//end method

    SlideUpPane.prototype.show = function(){
        this.visible = true;
        this.modifier.setTransform(Transform.translate(320,420,20), this.spring);
        this.modifier.setOpacity(1, {duration:200});
    };//end method

    SlideUpPane.prototype.render = function(){
        return this.visible ? this._node.render() : undefined;
    };//end method

    module.exports = SlideUpPane;
});

