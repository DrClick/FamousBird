define(function(require, exports, module) {
	var Timer = require('famous-utils/Time');
	var AppUtils = require('app/Util');
	var Matrix = require('famous/Matrix');
	var Modifier = require('famous/Modifier');
	var Surface = require('famous/Surface');
    var ContainerSurface = require('famous/ContainerSurface');
    var Modifier = require('famous/Modifier');
	
	

	function ButtonPane(view, opts){
		this.opts = {
			classes 	: [],
			visible 	: false,
			origin		: [.5,.5],
            position    : [0,150,0],
			size		: [600,100],
            buttons     : []
		};
		if (opts) this.setOpts(opts);


		this.surface = new ContainerSurface({
			size : this.opts.size,
			classes : ['unselectable'].concat(this.opts.classes)
		});

        this.modifier = new Modifier({
        		transform: Matrix.translate(this.opts.position[0], this.opts.position[1], this.opts.position[2]),
        		origin: [0.5, 0.5],
                opacity: 0
        	}
        );

        view._add(this.modifier).link(this.surface);

        //build the buttons
        for (var i = 0; i < this.opts.buttons.length; i++) {
            this.buildButtons(this.opts.buttons[i]);
        };
        
	}


    ButtonPane.prototype.buildButtons = function(button){
        
        var buttonSurface = new Surface({
            size: [130,40],
            content: '<button>' + button.text + '</button>'
        });

        var buttonModifier = new Modifier({
            transform: Matrix.translate(button.offsetX,0,0),
            origin: [.5,.5]
        });

        var me = this;
        //find the click event
        buttonSurface.on('click', function(evt){
            if(me.visible){
                evt.stopPropagation();
                button.callback();
            }
        });

        //add the button
        this.surface.add(buttonModifier).link(buttonSurface);
        
    };//end method





	ButtonPane.prototype.setOpts = function(opts){
		for (var key in opts) this.opts[key] = opts[key];
    };//end method


    ButtonPane.prototype.hide = function(){
    	var me = this;
        this.visible = false;
    	this.modifier.setOpacity(0, {duration: 100}, function(){
            this.modifier.setTransform(Matrix.translate(0,0,-1));//hides the buttons
        }.bind(this));
    };//end method

    ButtonPane.prototype.show = function(){
    	this.modifier.setOpacity(1, {duration: 100});
    	this.visible = true;
    };//end method

    ButtonPane.prototype.render = function(){
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

    module.exports = ButtonPane;
});

