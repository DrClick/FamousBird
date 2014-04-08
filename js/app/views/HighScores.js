define(function(require, exports, module) {
	
    var Surface             = require("famous/core/Surface");
    var ContainerSurface    = require("famous/surfaces/ContainerSurface");
    var View                = require("famous/core/View");
    var Scrollview          = require("famous/views/Scrollview");
    var Modifier            = require("famous/core/Modifier");
    var Transform           = require("famous/core/Transform");

    var Utils               = require("app/Util");
    var ProgressBar         = require("app/widgets/ProgressBar");
    

    function HighScores(options){
        View.apply(this, arguments);
        
        _create.call(this);
    };
    HighScores.prototype = Object.create(View.prototype); 
    HighScores.prototype.constructor = HighScores;
    HighScores.DEFAULT_OPTIONS = {
        visible: false,
        server: "//famous-bird.herokuapp.com/",
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
    };

    function _create(){
    	this.visible  = this.options.visible;

        //this will hold and clip the scroll view
        var scrollContainer = new ContainerSurface({
            size: [480,450],
            properties: {
                overflow:"hidden"
            }
        });
        this.scrollview = new Scrollview();
	    this.highScoreSurfaces = [];
	    this.scrollview.sequenceFrom(this.highScoreSurfaces);

        //add the scroll to the container and container to the view
        scrollContainer.add(new Modifier({
                size: [480, 500],
            }))
            .add(this.scrollview);
        //give the scroll view input
        scrollContainer.pipe(this.scrollview);

        this.add(new Modifier({
                origin: [.5,.5],
                size: [480, 500],
                transform: Transform.translate(5,50,100)
            }))
            .add(scrollContainer);


        //the border around the scores
        var windowSurface = new Surface({
            content: "<h3>High Scores</h3>",
            classes: ["highScores"],
            size: [510,530]
        })
        this.add(windowSurface);


        //close button
        var closeButton = new Surface({
            content: "X",
            classes: ["closeButton"],
            size: [20,20]
        })
        this.add(new Modifier({
                transform: Transform.translate(480,10,100)
            }))
            .add(closeButton);

        closeButton.on("click", function(){
            this.hide();
        }.bind(this));



        //progress Bar
        this.progressBar = new ProgressBar({
            progressProperties: this.options.progressProperties, 
            barProperties: this.options.barProperties
        });

        this.progressBar.show();
        this.add(new Modifier({
                origin: [.5,.5],
                size: [200,20]
            }))
            .add(this.progressBar);

        this.loadingSurface = new Surface({
            content: "Loading...",
            size: [200,20],
            properties: this.options.labelProperties
        });
        this.add(new Modifier({
                size: [200,20],
                origin: [.5,.5],
                transform: Transform.translate(0,-30,0)
            }))
            .add(this.loadingSurface);
        
    }

    function _getScores(){
        Utils.get(this.options.server + "/scores", _loadScores.bind(this), _fail);
    }

    function _loadScores(scores){
        var scoreData = JSON.parse(scores);

        var imgUrl = "//graph.facebook.com/@ID/picture";
        var item = "<img src='@src' onerror=\"this.src='content/images/user.png'\"/><label>@name</label><b>@score</b>";

        //populate
        for (var i = 0; i < scoreData.length; i++) {

            var score = scoreData[i];
            var src = imgUrl.replace("@ID", score.userId);
            var content = item.replace("@src", src)
                .replace("@name", score.name)
                .replace("@score", score.score)

            var temp = new Surface({
                 content: content,
                 size: [480, 60],
                 classes: ["highScoreItem"],
                 properties: {
                     backgroundColor: "hsl(" + (i * 360 / 40) + ", 100%, 50%)",
                     textAlign: "center"
                 }
            });

            temp.pipe(this.scrollview);
            this.highScoreSurfaces.push(temp);
        }

        this.progressBar.hide();
    }

    function _fail(){
        alert("unable to get high scores, try again later");
    }


    HighScores.prototype.show = function(){
        this.visible = true;
        _getScores.call(this);
    };

    HighScores.prototype.hide = function(){
        this.visible = false;
    };

    HighScores.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    };


	module.exports = HighScores;

});