define(function(require, exports, module) {
    "use strict";

    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Transform          = require("famous/Transform");
    var View            = require("famous/View");
    var AppUtils        = require("app/Util");
    var Timer           = require("famous-utils/Time");
    var SpringButton    = require("famous-ui/buttons/SpringButton");

    function SlideShow() {
        View.apply(this, arguments);

        _create.call(this);      
    }
    SlideShow.prototype = Object.create(View.prototype);
    SlideShow.prototype.constructor = SlideShow;
    SlideShow.DEFAULT_OPTIONS = {
        size: [640,960],
        origin: [.5,0],
        loop: false,
        autostart: true,
        startDelay: 1000,
        controlsYOffset: 400,
        controlOpacity: .3
    };

    function _create(){
        AppUtils.loadFragment("../fragments/SlideShowDef.js",{}, function(data){
            this.slides = JSON.parse(data);

            if(this.options.autostart){
                Timer.setTimeout(this.start.bind(this), this.options.startDelay);
            }//end if autostart
        }.bind(this));

        this.currentSlide = this.options.startAt || 0;
        this.playing = false;

        this.controls = {
            restart: _createControl.call(this, {xPos: -260, control: "restart"}),
            stop: _createControl.call(this, {xPos: -130, control: "stop"}),
            play: _createControl.call(this, {xPos: 20, control: "pause"}),
            backward: _createControl.call(this, {xPos: 170, control: "backward"}),
            forward: _createControl.call(this, {xPos: 300, control: "forward"})
        };

        this.controls.restart.on("click", this.restart.bind(this));
        this.controls.stop.on("click", this.stop.bind(this));
        this.controls.play.on("click", this.playPause.bind(this));
        this.controls.backward.on("click", this.back.bind(this));
        this.controls.forward.on("click", this.forward.bind(this));

       
    }//end create

    function _createControl(opts){

        var button = new SpringButton({
            content: "<div class='icon-slide-" + opts.control + "'></div>",
            size: [80,80],
            pos: [opts.xPos, this.options.controlsYOffset, 1]

        });

        this._add(new Modifier({origin:[.5,.5]})).add(button);

        return button;
    }//end create controls

    SlideShow.prototype.restart = function(){
        this.currentSlide = 0;
        this.start();
    };//end start
    

    SlideShow.prototype.start = function(){
        this.isPlaying = true;
        this.controls.play.surface.setContent("");  
        this.controls.play.surface.setClasses(['icon-slide-pause']);
        _showSlide.call(this, this.currentSlide); 
    };//end start

    SlideShow.prototype.stop = function(){
        this.isPlaying = false;
        this.controls.play.surface.setClasses(['icon-slide-play']);
    };//end start

    SlideShow.prototype.playPause = function(){
        if(this.isPlaying){
            this.stop();
        } else{
            this.start();
        }
    };//end start

    SlideShow.prototype.resume = function(){
        this.isPlaying = true;
    };//end start

    SlideShow.prototype.forward = function(){
        this.stop();
        var slideNum = (this.currentSlide + 1) % this.slides.length;
        this.currentSlide = slideNum;
        _showSlide.call(this, slideNum);
    };//end start

    SlideShow.prototype.back = function(){
        this.stop();
        var slideNum = (this.currentSlide - 1) > 0 ? this.currentSlide -1 : this.slides.length -1;
        this.currentSlide = slideNum;
        _showSlide.call(this, slideNum);
    };//end start


    SlideShow.prototype.skipTo = function(slideNumber){
        _showSlide.call(this, slideNumber);
    };//end start


    function _showSlide(slideNumber){
        var slide = this.slides[slideNumber];

        //hide any slide accept the requsted
        for (var i = 0; i < this.slides.length; i++) {
            if(i != slideNumber && this.slides[i].obj){
                this.slides[i].obj.modifier.setOpacity(0, {duration:100});
            }
        };

        if(!slide.obj){
            AppUtils.loadFragment("../fragments/" + slide.href, {}, function(data){
                var surface = new Surface({
                    classes: ['slide', 'slide_' + slideNumber],
                    size: this.options.size,
                    content: data
                });
                var modifier = new Modifier({
                    transform: Transform.translate(0,0,0),
                    origin: this.options.origin,
                    opacity: 0
                });


                surface.pipe(this.eventOutput);

                //add it to the view
                slide.obj = {surface: surface, modifier: modifier};
                this._add(modifier).add(surface);

                _animateSlide.call(this, slideNumber);
            }.bind(this));
        }//end if slide not loaded
        else{
            _animateSlide.call(this, slideNumber);
        }//end if slide loaded
    }//end function

    function _animateSlide(slideNumber){
         //animate it
            var slide = this.slides[slideNumber];
            var modifier = slide.obj.modifier;
            modifier.setOpacity(1, {duration:600});

            //animate out if not the last slide or if looping
            var showNext = this.isPlaying && this.currentSlide < (this.slides.length - 1);
            showNext = showNext || 
                (this.currentSlide == (this.slides.length - 1) && this.options.loop);

            if(showNext){
                if(this.animationTimer){Timer.removeTimeout(this.animationTimer);}
                this.animationTimer = Timer.setTimeout(function(){_showNext.call(this, slideNumber)}.bind(this), slide.duration);
            }//end if playing
        
    }//end animateSlid


    function _showNext(slideNumber){
        if(this.isPlaying){
            this.currentSlide = (this.currentSlide + 1) % this.slides.length;
            _showSlide.call(this, this.currentSlide);
        }//end if playing
    }//end amimate out

    module.exports = SlideShow;
});


