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
        View.apply(this, arguments);

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
        var content = "<div class='currentScore'>SCORE</div><div class='highScore'>BEST</div><div class='medal'>MEDAL</div>";

        var containerSurface = new ContainerSurface();

        this.spring = {
            method: 'spring',
            period: 300,
            dampingRatio: .5
        };

        this.modifier = new Modifier({
                size: this.options.size,
                transform: Transform.translate(320,1000,100),
                origin: [0.5, 0.5],
                opacity: 0
        });

        //node.add(this.modifier).add(this.surface);


        this.add(this.modifier).add(containerSurface);
        
        containerSurface.add(new Surface({
                classes : ['unselectable'].concat(this.options.classes),
                size: this.options.size,
                content: content
            }));

        //create surfaces and modifiers for showing the score and highscore
        var scoreSurface = new Surface({
            content: "<h1>0</h1>",
            size: [100,80],
            classes: ["scorer"]
        });
        var scoreModifier = new Modifier({
            transform: Transform.translate(420,70,50),
            origin: [.5,.5]
        });

        var highScoreSurface = new Surface({
            content: "<h1>" + (localStorage.getItem("HighScore") || 0) + "</h1>",
            size: [100,80],
            classes: ["scorer"]
        });
        var highScoreModifier = new Modifier({
            transform: Transform.translate(420,170,50),
            origin: [.5,.5]
        });


        containerSurface.add(scoreModifier).add(scoreSurface);
        containerSurface.add(highScoreModifier).add(highScoreSurface);

        this.showFunction = _countUpFinalScore.bind(this, this.options.score, scoreSurface, highScoreSurface);

    }//end create


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

    SlideUpPane.prototype.hide = function(){
    	this.modifier.setOpacity(0, {duration: 400});
        this.visible = false;
    };//end method

    SlideUpPane.prototype.show = function(){
        this.visible = true;
        this.modifier.setTransform(Transform.translate(320,420,100), this.spring);
        this.modifier.setOpacity(1, {duration:200});

        this.showFunction();
    };//end method

    SlideUpPane.prototype.render = function(){
        return this.visible ? this._node.render() : undefined;
    };//end method

    module.exports = SlideUpPane;
});

