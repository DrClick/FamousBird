define(function(require, exports, module) {
    "use strict";

    //Famous
    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");
    var Scrollview      = require('famous-views/Scrollview');

    //App
    var AppUtils        = require("app/Util");
    //var Prettify        = require("lib/prettify/run_prettify");


    function BoringView() {
        View.apply(this, arguments);

        var me = this;
        _create.call(this);
    }
    BoringView.prototype = Object.create(View.prototype);
    BoringView.prototype.constructor = BoringView;
    BoringView.DEFAULT_OPTIONS = {};


    function _create(){

        AppUtils.loadFragment("/fragments/boring.html", {}, function(frag){

            this.surface = new Surface({
                size: [640, 4000],
                properties: {
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                },
                content: frag,
                classes: ["boring"]
            });

            this.modifier = new Modifier({
                transform: Matrix.translate(0,0,0),
                size: [640,960],
                origin: [.5,0]
            });


            // create the scrollview
            this.boringScrollView = new Scrollview({
                direction: "y",
                margin: 4000
            });

            // link the tweet widgets in
            this.boringScrollView.sequenceFrom(this.surface);


            this._add(this.modifier).link(this.boringScrollView);

            this.surface.pipe(this.eventOutput);
            this.surface.pipe(this.boringScrollView);            

        }.bind(this));
        
    }

    module.exports = BoringView;
});


