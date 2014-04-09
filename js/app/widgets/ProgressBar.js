define(function(require, exports, module) {  	
    var Surface   = require('famous/core/Surface');
    var Modifier  = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var View      = require('famous/core/View');

    function ProgressBar(options) {
        View.apply(this, arguments);

        _create.call(this);

    }
    ProgressBar.prototype = Object.create( View.prototype );
    ProgressBar.prototype.constructor = ProgressBar;
    ProgressBar.DEFAULT_OPTIONS = {
        visible: false,
        size: [200, 10],
        defaultValue: 0,
        progressProperties: {border: "solid 1px blue"},
        barProperties: {backgroundColor: "#fcfcfc"},
        transition: {
            duration: 100
        }
    }

    function _create(){
        this.visible = this.options.visible;

        this.fill = new Surface({
            size: this.options.size,
            properties: this.options.progressProperties
        });

        this.back = new Surface({
            size: this.options.size,
            properties: this.options.barProperties
        });

        this.fillMod = new Modifier({
            transform : Transform.scale( this.options.defaultValue, 1, 1 )

        });

        this.add(this.fillMod).add(this.fill);
        this.add(this.back);
    }

    ProgressBar.prototype.setProgress = function ( percent ) {

        this.fillMod.halt();
        this.fillMod.setTransform(
            Transform.scale( percent, 1, 1 ),
            this.options.transition
        );

    }

    ProgressBar.prototype.setSize = function ( arr ) {
        this.setOptions({ size: arr });
        this.fill.setSize(this.options.size);
        this.back.setSize(this.options.size);
    }

    ProgressBar.prototype.getSize = function () {
        return this.back.getSize();
    }

    ProgressBar.prototype.show = function(){
        this.visible = true;
    }

    ProgressBar.prototype.hide = function(){
        this.visible = false;
    }

    ProgressBar.prototype.render = function () {
        return this.visible ? this._node.render() : undefined;
    }

    module.exports = ProgressBar;
});