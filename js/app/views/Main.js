define(function(require, exports, module) {
    "use strict";

    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");

    function MainView() {
        View.apply(this, arguments);

        var me = this;
        _createPage.call(this);
    }
    MainView.prototype = Object.create(View.prototype);
    MainView.prototype.constructor = MainView;
    MainView.DEFAULT_OPTIONS = {};


    function _createPage(){
        this.surface = new Surface({
            size: [640, 960],
            properties: {
                backgroundColor: 'black'
            },
            content: "<h1>Hi</h1>"
        });

        this.modifier = new Modifier({
            transform: Matrix.translate(0,0,1),
            origin: [.5,0]
        });

        this._add(this.modifier).link(this.surface);

        this.surface.pipe(this.eventOutput);
    }

    module.exports = MainView;
});


