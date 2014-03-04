define(function(require, exports, module) {
    "use strict";

    //famous 
    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");


    //app
    var SlideShow       = require("app/widgets/SlideShow");


    function MainView() {
        View.apply(this, arguments);

        var me = this;
        _createPage.call(this);
        _createSlideShow.call(this);
    }
    MainView.prototype = Object.create(View.prototype);
    MainView.prototype.constructor = MainView;
    MainView.DEFAULT_OPTIONS = {};


    function _createPage(){
        this.surface = new Surface({
            size: [640, 960],
            properties: {
                backgroundColor: 'black',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            },
            classes: ["main"]
        });

        this.modifier = new Modifier({
            transform: Matrix.translate(0,0,0),
            size: [640, 960],
            origin: [.5,0]
        });

        this._add(this.modifier).link(this.surface);




        this.surface.pipe(this.eventOutput);
    }//end createPage


    function _createSlideShow(){
        var slideShow = new SlideShow({startAt: 0});
        slideShow.pipe(this.eventOutput);
        var modifier = new Modifier({
            transform: Matrix.translate(0,0,0),
            origin:[0.5,.5]});
        this._add(modifier).link(slideShow);
    }//end createSlideShow

    module.exports = MainView;
});


