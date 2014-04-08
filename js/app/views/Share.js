define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Surface     = require('famous/core/Surface');

    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var View        = require("famous/core/View");
    var Timer		= require("famous/utilities/Timer");

    var FBFunctions = require("app/FB");
      
    /** @constructor */
    function Share(options){
        View.apply(this, arguments);
        
        _create.call(this);
    };
    Share.prototype = Object.create(View.prototype); 
    Share.prototype.constructor = Share;
    Share.DEFAULT_OPTIONS = {
        visible: false,
        server: "//famous-bird.herokuapp.com/"
    };

    function _create(){

        //FB likes to lock up the UI when it inits, so lets let the UI
        //finish up before initing.
        Timer.setTimeout(function(){
            FBFunctions.init();
        }, 100);
        

        this.surface = new Surface({
            size : [300,300],
            classes: ["share"],
            content: 
            	"<div class='fb-login-button' data-show-faces='true' " +
            		"data-width='200' data-max-rows='1' data-scope='publish_actions'>" +
				"</div>"
        });

        this.modifier = new Modifier({
            transform: Transform.translate(320, 480, 1000),
            origin: [.5,.5]
        }); 

        this.add(this.modifier).add(this.surface)

        this.visible = this.options.visible;
    }

    Share.prototype.share = function(score){
    	FBFunctions.isLoggedIn(function(response){
    		if(!response.status) FBFunctions.login(
                function(response){
                    response.score = score;
                    this.postScore(response);
                }.bind(this));
            else{
                response.score = score;
                this.postScore(response);
            }
            
    	}.bind(this));
    }

    Share.prototype.postScore = function(scoreData){
        
        //like page
        var likeUrl = "https://graph.facebook.com/me/og.likes";
        FBFunctions.FB().api(likeUrl,'post',{game: "demo.famou.us/famous-bird"});

        //share score
        var shareUrl = 'https://graph.facebook.com/me/scores?score=USER_SCORE&access_token=APP_ACCESS_TOKEN'
                .replace("USER_SCORE", scoreData.score)
                .replace("APP_ACCESS_TOKEN", scoreData.token);

    	FBFunctions.FB().api(
           shareUrl,
           'post',
            {game: "demo.famou.us/famous-bird"},
            function(response) {
                alert("Hey " + scoreData.name + " thanks for sharing!");
            }
        );

        //store score
        var presistUrl = this.options.server + "/scores";
        var postScoreRequest = new XMLHttpRequest();
        postScoreRequest.open('POST', presistUrl, true);
        postScoreRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");


        postScoreRequest.send("data=" + JSON.stringify({
            name: scoreData.name,
            score: scoreData.score || 0,
            id: scoreData.uid
        }));
    }




    Share.prototype.show = function(){
        this.visible = true;

        // //allows the inclusion of this render node in the DOM before 
        // //trying to build the facebook elements
        // Timer.setTimeout(function(){
        // 	FB.XFBML.parse(document.querySelector('.share'));
        // },100);
        
    };

    Share.prototype.hide = function(){
        this.visible = false;
    };

    Share.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    }


	module.exports = Share;
});



