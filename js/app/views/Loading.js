define(function(require, exports, module) {
    "use strict";
    var View 		= require("famous/core/View");
    var Modifier 	= require("famous/core/Modifier");
    var Transform 	= require("famous/core/Transform");
    var Surface 	= require("famous/core/Surface");

    var ProgressBar = require("app/widgets/ProgressBar");

    function Loading(options){
    	View.apply(this, arguments);

    	_create.call(this);
    }
    Loading.prototype = Object.create(View.prototype);
    Loading.prototype.constructor = Loading;
    Loading.DEFAULT_OPTIONS = {
    	visible: false,
    	labelProperties: {
    		fontSize: "20px", 
    		color: "white", 
    		textShadow: "3px 3px 0px black",
    		textAlign: "center"},
    	progressProperties: {
    		borderRadius: "10px",
    		border: "solid 1px white"
    	},
    	barProperties: {
    		borderRadius: "10px",
    		backgroundColor: "#3cf"
    	}
    }

    function _create(){
    	this.visible = this.options.visible;

    	this.progressBar = new ProgressBar({
	        progressProperties: this.options.progressProperties, 
	        barProperties: this.options.barProperties
	    });

    	this.progressBar.show();
    	this.add(new Modifier({
    			origin: [.5,.5],
    			size: [200,20],
    			transform: Transform.translate(0,-30,1)
    		}))
    		.add(this.progressBar);

    	this.surface = new Surface({
    		content: "Loading...",
    		size: [200,20],
    		properties: this.options.labelProperties
    	});
    	this.add(new Modifier({
    			origin: [.5,.5],
    			size: [200,20],
    			transform: Transform.translate(0,-60,1)
    		}))
    		.add(this.surface);
 
    };

    Loading.prototype.setProgress = function setProgress(progress){
    	this.progressBar.setProgress(progress);
    }

    Loading.prototype.reset = function reset(){
    	this.progressBar.setProgress(0);
    }

    Loading.prototype.show = function(){
        this.visible = true;
    };

    Loading.prototype.hide = function(){
        this.visible = false;
    };

    Loading.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    }


    module.exports = Loading;
});