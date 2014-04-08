define(function(require, exports, module) {
	
    var Surface     = require("famous/core/Surface");
    var View        = require("famous/core/View");
    var Scrollview  = require("famous/views/Scrollview");
    var Timer       = require("famous/utilities/Timer");

    var BouncyPane = require("app/widgets/BouncyPane");
    var ButtonPane = require("app/widgets/ButtonPane");
    var HighScores = require("app/views/HighScores");

    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");

    

    function Welcome(options){
        View.apply(this, arguments);
        
        _create.call(this);
    };
    Welcome.prototype = Object.create(View.prototype); 
    Welcome.prototype.constructor = Welcome;
    Welcome.DEFAULT_OPTIONS = {
        visible: false
    };

    function _create(){
    	this.visible  = this.options.visible;
        
    	this.bouncyPane = new BouncyPane({
            content: "<h1>Famous Bird</h1>",
            classes: ["startup"]
        });

        this.add(this.bouncyPane);
        

        this.buttons = new ButtonPane({
            buttons: [
                {text: "START", callback: _showGetReadyScreen.bind(this), offsetX: -120},
                {text: "SCORES", callback: _showHighScores.bind(this), offsetX: 120}
            ]
        });
        this.add(this.buttons);



        //make sure draggable events on these views are piped up
        this.bouncyPane.pipe(this._eventOutput);
        this.buttons.pipe(this._eventOutput);
        
    }


    function _showGetReadyScreen(){
        this._eventOutput.emit("ready");
        this.hide();
    }


    function _showHighScores(){
        var highScores = new HighScores();
        this.add(highScores);
        highScores.show();
    }




    Welcome.prototype.show = function(Welcome){
        this.visible = true;
        this.buttons.show();
        this.bouncyPane.show();
    };

    Welcome.prototype.hide = function(Welcome){
        this.buttons.hide();
        this.bouncyPane.hide();

         //let the application hide before removing it
        Timer.setTimeout(function(){
            this.visible = false;
        }.bind(this), 1000)
    };

    Welcome.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    }


	module.exports = Welcome;

});