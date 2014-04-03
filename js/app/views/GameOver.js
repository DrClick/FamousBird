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

	function GameOverView(physicsEngine, options){
		View.apply(this, [options]);
		this.physicsEngine = physicsEngine;

		_create.call(this);

	}
	GameOverView.prototype = Object.create(View.prototype);
	GameOverView.prototype.constructor = GameOverView;
	GameOverView.DEFAULT_OPTIONS = {
		visible: false
	}


	function _create(){
		this.bouncyPane = new BouncyPane(this.physicsEngine, {
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


        _createFinalScorePane.call(this);

        
	}


	function _restart(){
    	location.reload();
    }//end restart

    function _share(){
        alert("This is a private beta, no sharing for now.");
    };


	function _createFinalScorePane(){
		var content = "<div class='currentScore'>SCORE</div><div class='highScore'>BEST</div><div class='medal'>MEDAL</div>";

		//create surfaces and modifiers for showing the score and highscore
        var scoreSurface = new Surface({
            content: "<h1>0</h1>",
            size: [100,80],
            classes: ["scorer"]
        });
        var scoreModifier = new Modifier({
            transform: Transform.translate(180,-60,50),
            origin: [.5,.5]
        });

        var highScoreSurface = new Surface({
            content: "<h1>" + (localStorage.getItem("HighScore") || 0) + "</h1>",
            size: [100,80],
            classes: ["scorer"]
        });
        var highScoreModifier = new Modifier({
            transform: Transform.translate(180,40,50),
            origin: [.5,.5]
        });


        this.finalScore = new SlideUpPane(
            {
                size:[500,250],
                content: content,
                classes: ["finalScore"]
            }
        );

        this.finalScore.surface.add(scoreModifier).add(scoreSurface);
        this.finalScore.surface.add(highScoreModifier).add(highScoreSurface);

        //add the final score pane and show it
        this.add(this.finalScore);
        this.finalScore.show();


        _countUpFinalScore.call(this, this.options.score, scoreSurface, highScoreSurface);

    
    }//end create final score pane


    function _countUpFinalScore(score, scoreSurface, highScoreSurface){
    	//start the score counting up
        var scoreUpCounter = 0;
        this.counter = Timer.setInterval(function(){
            scoreUpCounter++;
            if(scoreUpCounter <= score){
                scoreSurface.setContent("<h1>" + scoreUpCounter + "</h1>");

                //set the highscore if higher than the local score
                if(scoreUpCounter > localStorage.getItem("HighScore")){
                    localStorage.setItem("HighScore", scoreUpCounter);
                    highScoreSurface.setContent("<h1>" + scoreUpCounter + "</h1>");
                }
            }
            else{
                Timer.clear(this.counter);
            }
        }.bind(this),40);
    }




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