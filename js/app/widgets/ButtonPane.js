define(function(require, exports, module) {
	var Timer = require('famous-utils/Time');
	var AppUtils = require('app/Util');
	var Matrix = require('famous/Matrix');
	var Modifier = require('famous/Modifier');
	var Surface = require('famous/Surface');
    var ContainerSurface = require('famous/ContainerSurface');
    var Modifier = require('famous/Modifier');
	var View = require("famous/View");
	

	function ButtonPane(node, options){
        View.apply(this, [options]);

		_create.call(this, node);     
	}
    ButtonPane.prototype = Object.create(View.prototype);
    ButtonPane.prototype.constructor = ButtonPane;
    ButtonPane.DEFAULT_OPTIONS = {
        classes     : [],
        visible     : false,
        origin      : [.5,.5],
        position    : [0,150,10],
        size        : [600,100],
        buttons     : []
    };


    function _create(node){
        this.surface = new ContainerSurface({
            size : this.options.size,
            classes : ['unselectable'].concat(this.options.classes)
        });

        this.modifier = new Modifier({
                transform: Matrix.translate(this.options.position[0], this.options.position[1], this.options.position[2]),
                origin: [0.5, 0.5],
                opacity: 0
            }
        );

        node.add(this.modifier).link(this.surface);
        this.surface.pipe(this.eventOutput);

        
        //build the buttons
        for (var i = 0; i < this.options.buttons.length; i++) {
            _buildButtons.call(this, this.options.buttons[i]);
        };
    }

    function _buildButtons(button){
        
        var buttonSurface = new Surface({
            size: [130,40],
            content: '<button>' + button.text + '</button>'
        });

        var buttonModifier = new Modifier({
            transform: Matrix.translate(button.offsetX,0,10),
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
        
    }//end build buttons


    ButtonPane.prototype.hide = function(){
        this.visible = false;
    	this.modifier.setOpacity(0, {duration: 100}, function(){
            this.modifier.setTransform(Matrix.translate(0,0,-1));//hides the buttons
        }.bind(this));
    };//end method

    ButtonPane.prototype.show = function(){
        this.modifier.setTransform(
            Matrix.translate(this.options.position[0],this.options.position[1],this.options.position[2]), 
            {}, 
            function(){
                this.modifier.setOpacity(1, {duration: 100});
                this.visible = true;
            }.bind(this)
        );//hides the buttons
    };//end method

    ButtonPane.prototype.render = function(){
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
    };//end render

    module.exports = ButtonPane;
});

