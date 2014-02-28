define(function(require, exports, module) {
    var Surface         = require('famous/Surface');
    var Modifier        = require('famous/Modifier');
    var Matrix          = require('famous/Matrix');
    var View            = require('famous/View');

    function Page() {
        View.apply(this, arguments);
    }

    Page.prototype = Object.create(View.prototype);
    Page.prototype.constructor = MyView;

    Page.DEFAULT_OPTIONS = {};

    module.exports = Page;
});