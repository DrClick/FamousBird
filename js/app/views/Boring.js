define(function(require, exports, module) {
    "use strict";

    //Famous
    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");

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
                size: [640, 960],
                properties: {
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                },
                content: "<pre class='prettyprint lang-js'>" + frag + "</pre>",
                classes: ["boring"]
            });

            this.modifier = new Modifier({
                transform: Matrix.translate(0,0,0),
                origin: [.5,0]
            });

            this._add(this.modifier).link(this.surface);

            this.surface.pipe(this.eventOutput);

        }.bind(this));
        
    }

    module.exports = BoringView;
});


