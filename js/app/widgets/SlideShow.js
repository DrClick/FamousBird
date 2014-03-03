define(function(require, exports, module) {
    "use strict";

    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");
    var AppUtils        = require("app/Util");
    var Timer           = require("famous-utils/Time");

    function SlideShow() {
        View.apply(this, arguments);

        _create.call(this);      
    }
    SlideShow.prototype = Object.create(View.prototype);
    SlideShow.prototype.constructor = SlideShow;
    SlideShow.DEFAULT_OPTIONS = {
        size: [600,500],
        origin: [.5,0],
        loop: false,
        autostart: true,
        startDelay: 1000,
        controlsYOffset: 300,
        controlOpacity: .3
    };

    function _create(){
        AppUtils.loadFragment("/fragments/SlideShowDef.js",{}, function(data){
            this.slides = JSON.parse(data);

            if(this.options.autostart){
                Timer.setTimeout(this.start.bind(this), this.options.startDelay);
            }//end if autostart
        }.bind(this));

        this.currentSlide = this.options.startAt || 0;
        this.playing = false;

        this.controls = {
            restart: _createControl.call(this, {xPos: -280, control: "restart"}),
            stop: _createControl.call(this, {xPos: -150, control: "stop"}),
            backward: _createControl.call(this, {xPos: 0, control: "backward"}),
            play: _createControl.call(this, {xPos: 150, control: "play"}),
            forward: _createControl.call(this, {xPos: 280, control: "forward"})
        };


       
    }//end create

    function _createControl(opts){

        var modifier = new Modifier({
                transform: Matrix.multiply(
                    Matrix.translate(opts.xPos,this.options.controlsYOffset,1),
                    Matrix.scale(1, 1, 0)),
                opacity: this.options.controlOpacity,
                origin: [.5, .5]
        });

        //add the cloud off screen
        var surface = new Surface({
            size : [80, 80],
            classes : ["controls", "icon-slide-" + opts.control]
        });

        this._add(modifier).link(surface);

        return surface;
    }//end create controls


    SlideShow.prototype.start = function(){
        this.isPlaying = true;
        _showSlide.call(this, this.currentSlide); 
    };//end start

    SlideShow.prototype.pause = function(){
        this.isPlaying = false;
    };//end start

    SlideShow.prototype.resume = function(){
        this.isPlaying = true;
    };//end start

    SlideShow.prototype.skipTo = function(slideNumber){
        _show.call(this, slideNumber);
    };//end start


    function _showSlide(slideNumber){
        var slide = this.slides[slideNumber];

        AppUtils.loadFragment("/fragments/" + slide.href, {}, function(data){
            var surface = new Surface({
                classes: ['slide', 'slide_' + slideNumber],
                size: this.options.size,
                content: data
            });
            var modifier = new Modifier({
                transform: Matrix.translate(0,0,0),
                origin: this.options.origin,
                opacity: 0
            });


            surface.pipe(this.eventOutput);

            //add it to the view
            this._add(modifier).link(surface);

            //animate it
            modifier.setOpacity(1, {duration:600});

            if(this.isPlaying && this.currentSlide < (this.slides.length - 1)){
                Timer.setTimeout(function(){
                    modifier.setOpacity(0, {duration:300});
                    this.currentSlide++;
                    _showSlide.call(this, this.currentSlide);
                }.bind(this), slide.duration);
            }//end if playing

        }.bind(this));
    }//end function


    module.exports = SlideShow;
});


