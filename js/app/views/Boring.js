define(function(require, exports, module) {
    "use strict";

    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");

    function BoringView() {
        View.apply(this, arguments);

        var me = this;
        _create.call(this);
    }
    BoringView.prototype = Object.create(View.prototype);
    BoringView.prototype.constructor = BoringView;
    BoringView.DEFAULT_OPTIONS = {};


    function _create(){
        this.surface = new Surface({
            size: [640, 960],
            properties: {
                backgroundColor: 'pink'
            },
            content: "<h1>Boring</h1>",
            classes: ["boring"]
        });

        this.modifier = new Modifier({
            transform: Matrix.translate(0,0,0),
            origin: [.5,0]
        });

        this._add(this.modifier).link(this.surface);

        this.surface.pipe(this.eventOutput);
    }

    module.exports = BoringView;
});


