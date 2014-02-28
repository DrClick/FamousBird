define(function(require, exports, module) {
    "use strict";

    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");




    function Resume() {
        View.apply(this, arguments);
    }

    Resume.prototype = Object.create(View.prototype);
    Resume.prototype.constructor = MyView;

    Resume.DEFAULT_OPTIONS = {};

    module.exports = Resume;
});