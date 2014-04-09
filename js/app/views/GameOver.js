define(function(require, exports, module){
	"use strict";

	//View
    var View 			= require("famous/core/View");
    var Timer 			= require("famous/utilities/Timer");
    var Surface 		= require("famous/core/Surface");
    var Modifier 		= require("famous/core/Modifier");
    var Transform 		= require("famous/core/Transform");

    var BouncyPane 		= require("app/widgets/BouncyPane");
    var ButtonPane 		= require("app/widgets/ButtonPane");
    var SlideUpPane 	= require("app/widgets/SlideUpPane");
    var Share           = require("./Share");

    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");

    

	function GameOverView(options){
		View.apply(this, [options]);

		_create.call(this);

	}
	GameOverView.prototype = Object.create(View.prototype);
	GameOverView.prototype.constructor = GameOverView;
	GameOverView.DEFAULT_OPTIONS = {
		visible: false
	}


	function _create(){

        this.physicsEngine = PhysicsEngineFactory.getEngine();

		this.bouncyPane = new BouncyPane({
            content: "<h1>Game Over</h1>",
            classes: ["gameOver"]
        });
        this.add(this.bouncyPane);


        this.gameOverButtons = new ButtonPane({
            buttons: [
                {text: "OK", callback: _restart.bind(this), offsetX: -120},
                {text: "SHARE", callback: _share.bind(this), offsetX: 120}
            ]
        });
        this.add(this.gameOverButtons);

        //make sure draggable events on these views are piped up
        this.bouncyPane.pipe(this._eventOutput);
        this.gameOverButtons.pipe(this._eventOutput);

        this.share = new Share();
        this.add(this.share);

        _createFinalScorePane.call(this);
	}


	function _restart(){
    	location.reload();
    }//end restart

    function _share(){
        this.share.share(this.options.score);
    };


	function _createFinalScorePane(){

        this.finalScore = new SlideUpPane(
            {
                size:[500,250],
                classes: ["finalScore"],
                score: this.options.score
            }
        );
        this.add(this.finalScore);
        this.finalScore.show();

    }//end create final score pane




	GameOverView.prototype.show = function show(){
		this.visible = true;

		this.bouncyPane.show();

		//display the buttons pane
        Timer.setTimeout(function(){
            this.gameOverButtons.show();
        }.bind(this),300);

	}

	GameOverView.prototype.render = function render(){
		return this.visible ? this._node.render() : undefined;
	}

	module.exports = GameOverView;
});