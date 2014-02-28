define(function(require, exports, module) {
    "use strict";
    //Famous
    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");
    var GenericSync     = require('famous-sync/GenericSync');
    var Transitionable  = require('famous/Transitionable');


    //App
    var MainView        = require("app/views/Main");
    var GameView        = require("app/views/Game");
    var BoringView      = require("app/views/Boring");




    function Resume() {
        View.apply(this, arguments);

        var me = this;
        _createPageView.call(this);
        _createGameView.call(this);
        _createBoringView.call(this);
        _handleTouch.call(this);
    }

    Resume.prototype = Object.create(View.prototype);
    Resume.prototype.constructor = Resume;

    Resume.DEFAULT_OPTIONS = {};

    function _createPageView() {
        this.mainView = new MainView();
        this.mainMod = new Modifier({
            transform: Matrix.translate(0, 0, 3)
        });
        this._add(this.mainMod).link(this.mainView);
    }

    function _createGameView() {
        this.gameView = new GameView();
        this.gameMod = new Modifier({
            transform: Matrix.translate(0, 0, 2)
        });
        this._add(this.gameMod).link(this.gameView);
    }
    function _createBoringView() {
        this.boringView = new BoringView();
        this.boringMod = new Modifier({
            transform: Matrix.translate(0, 0, 1)
        });
        this._add(this.boringMod).link(this.boringView);
    }

    function _handleTouch() {

        this.mainViewPos = 0;

        this.sync = new GenericSync(function() {
            return this.mainViewPos;
        }.bind(this), {direction: GenericSync.DIRECTION_X});

        this.mainView.pipe(this.sync);
        
        this.sync.on('update', function(data) {
            console.log(data);
            this.mainViewPos = data.p;
            this.mainMod.setTransform(Matrix.translate(data.p, 0, 3));

            
        }.bind(this));
    }


    module.exports = Resume;
});