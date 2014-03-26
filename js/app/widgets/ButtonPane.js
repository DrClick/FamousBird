define(function(require, exports, module) {
	var AppUtils = require('app/Util');
	var Transform = require('famous/core/Transform');
	var Modifier = require('famous/core/Modifier');
	var Surface = require('famous/core/Surface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Modifier = require('famous/core/Modifier');
	var View = require("famous/core/View");
	

	function ButtonPane(options){
        View.apply(this, [options]);

		_create.call(this);     
	}
    ButtonPane.prototype = Object.create(View.prototype);
    ButtonPane.prototype.constructor = ButtonPane;
    ButtonPane.DEFAULT_OPTIONS = {
        classes     : [],
        visible     : false,
        origin      : [.5,.5],
        position    : [580,700,10],
        size        : [600,100],
        buttons     : []
    };


    function _create(){
        this.surface = new ContainerSurface({
            size : this.options.size,
            classes : ['unselectable'].concat(this.options.classes)
        });

        this.modifier = new Modifier({
            transform: Transform.translate(this.options.position[0], this.options.position[1], this.options.position[2]),
            origin: [0.5, 0.5],
            size: this.options.size,
            opacity: 0.001
        });

        this._add(this.modifier).add(this.surface);
        this.surface.pipe(this._eventOutput);

        
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
            transform: Transform.translate(button.offsetX,0,this.options.position[2]),
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
        this.surface.add(buttonModifier).add(buttonSurface);
        
    }//end build buttons


    ButtonPane.prototype.hide = function(){
        this.visible = false;
    	this.modifier.setOpacity(0, {duration: 100}, function(){
            this.modifier.setTransform(Transform.translate(0,0,-1));//hides the buttons
        }.bind(this));
    };//end method

    ButtonPane.prototype.show = function(){
        this.modifier.setTransform(
            Transform.translate(this.options.position[0],this.options.position[1],this.options.position[2]), 
            {}, 
            function(){
                this.modifier.setOpacity(1, {duration: 100});
                this.visible = true;
            }.bind(this)
        );//hides the buttons
    };//end method

   

    module.exports = ButtonPane;
});

