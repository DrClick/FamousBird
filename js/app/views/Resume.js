define(function(require, exports, module) {
    "use strict";
    //Famous
    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");
    var GenericSync     = require('famous-sync/GenericSync');
    var Transitionable  = require('famous/Transitionable');
    var Timer = require("famous-utils/Time");

    //App
    var MainView        = require("app/views/Main");
    var GameView        = require("app/views/Game");
    var BoringView      = require("app/views/Boring");




    function Resume() {
        View.apply(this, arguments);

        this.cardIndex = {main:3, game:2, boring: 1};

        _createPageView.call(this);
        _createGameView.call(this);
        _createBoringView.call(this);
        _handleTouch.call(this);
    }

    Resume.prototype = Object.create(View.prototype);
    Resume.prototype.constructor = Resume;

    Resume.DEFAULT_OPTIONS = {};

    function _createPageView() {
        this.mainViewPos = new Transitionable(0);
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

        

        this.sync = new GenericSync(function() {
            return this.mainViewPos.get(0);
        }.bind(this), {direction: GenericSync.DIRECTION_X});

        this.mainView.pipe(this.sync);
        
        this.sync.on('update', _slideCards.bind(this));
    }

    function _slideCards(data){
        console.log(data);
        this.mainViewPos.set(data.p);

        //change what card is visible
        this.cardIndex.boring = (data.p >= 0) ? 2: 1;
        this.cardIndex.game = (data.p < 0) ? 2: 1;


        if(data.v >2){
            console.log("swipe right");
            this.cardIndex.main = 0;
        }
    }

    Resume.prototype.render = function() {
        this.spec = [];

        this.spec.push({
            transform: Matrix.translate(0, 0, this.cardIndex.game),
            target: this.gameView.render()
        });

        this.spec.push({
            transform: Matrix.translate(0, 0, this.cardIndex.boring),
            target: this.boringView.render()
        });

        this.spec.push({
            transform: Matrix.translate(this.mainViewPos.get(), 0, this.cardIndex.main),
            target: this.mainView.render()
        });

        return this.spec;
    };


    module.exports = Resume;
});