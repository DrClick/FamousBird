define(function(require, exports, module) {
    "use strict";
    //Famous
    var Surface         = require("famous/Surface");
    var Modifier        = require("famous/Modifier");
    var Matrix          = require("famous/Matrix");
    var View            = require("famous/View");
    var GenericSync     = require('famous-sync/GenericSync');
    var MouseSync       = require("famous-sync/MouseSync");
    var TouchSync      = require("famous-sync/TouchSync");
    var Transitionable  = require('famous/Transitionable');
    var Timer           = require("famous-utils/Time");

    //App
    var MainView        = require("app/views/Main");
    var GameView        = require("app/views/Game");
    var BoringView      = require("app/views/Boring");




    function Resume() {
        View.apply(this, arguments);

        //the card index controls which card is on top
        this.cardIndex = {main:2, game:1, boring: 0};
        this.topCardPos = null;


        //create syncs to handle updates
        this.mainSync = new GenericSync(function() {
            return this.mainViewPos.get(0);
        }.bind(this), {direction: GenericSync.DIRECTION_X, syncClasses:[MouseSync, TouchSync]});
        
        this.gameSync = new GenericSync(function() {
            return this.gameViewPos.get(0);
        }.bind(this), {direction: GenericSync.DIRECTION_X, syncClasses:[MouseSync, TouchSync]});
        
        this.boringSync = new GenericSync(function() {
            return this.boringViewPos.get(0);
        }.bind(this), {direction: GenericSync.DIRECTION_X, syncClasses:[MouseSync, TouchSync]});


        //create the views
        _createMainView.call(this);
        _createGameView.call(this);
        _createBoringView.call(this);
        _handleTouch.call(this);
    }

    Resume.prototype = Object.create(View.prototype);
    Resume.prototype.constructor = Resume;

    Resume.DEFAULT_OPTIONS = {
        posThreshold: 200,
        velThreshold: 0.75
    };

    function _createMainView() {
        this.mainViewPos = new Transitionable(0);
        this.mainViewPos.name = 'mainView';
        this.topCardPos = this.mainViewPos;

        this.mainView = new MainView();
        this.mainMod = new Modifier({
            transform: Matrix.translate(0, 0, 3)
        });
        this._add(this.mainMod).link(this.mainView);
    }

    function _createGameView() {
        this.gameViewPos = new Transitionable(0);
        this.gameViewPos.name = 'gameView';
        this.gameView = new GameView();
        this.gameMod = new Modifier({
            transform: Matrix.translate(0, 0, 2)
        });
        this._add(this.gameMod).link(this.gameView);
    }
    function _createBoringView() {
        this.boringViewPos = new Transitionable(0);
        this.boringView = new BoringView();
        this.boringMod = new Modifier({
            transform: Matrix.translate(0, 0, 1)
        });
        this._add(this.boringMod).link(this.boringView);
    }

    function _handleTouch() {
        this.mainView.pipe(this.mainSync);
        this.gameView.pipe(this.gameSync);
        this.boringView.pipe(this.boringSync);

        this.mainSync.on('update', _slideCards.bind(this));
        this.mainSync.on('end', _processSwipe.bind(this));

        this.gameSync.on('update', _slideCards.bind(this));
        this.gameSync.on('end', _processSwipe.bind(this));

        this.boringSync.on('update', _slideCards.bind(this));
        this.boringSync.on('end', _processSwipe.bind(this));
    }

    function _slideCards(data){
        if(Math.abs(data.p)>8){//if its not just an accidental touch
            this.topCardPos.set(data.p);
        }

        //change what card is visible
        if(this.cardIndex.main == 2){
            this.cardIndex.boring = (data.p >= 0) ? 1: 0;
            this.cardIndex.game = (data.p < 0) ? 1: 0;
        }
        if(this.cardIndex.game == 2){
            this.cardIndex.main = (data.p >= 0) ? 1: 0;
            this.cardIndex.boring = (data.p < 0) ? 1: 0;
        }
        if(this.cardIndex.boring == 2){
            this.cardIndex.game = (data.p >= 0) ? 1: 0;
            this.cardIndex.main = (data.p < 0) ? 1: 0;
        }
    }

    function _processSwipe(data){
        var velocity = data.v;
        var position = this.topCardPos.get();

        //reset the top card
        this.topCardPos.set(0);

        if( Math.abs(position) > this.options.posThreshold ||
            Math.abs(velocity) > this.options.velThreshold) {
            this.shuffle();
        }
    }//end function


    Resume.prototype.shuffle = function(){
        for (var card in this.cardIndex){
            this.cardIndex[card] = (this.cardIndex[card] + 1) % 3;
        }

        if( this.cardIndex.main==2){console.log("Main On TOp");}

        if(this.cardIndex.main == 2){this.topCardPos = this.mainViewPos};
        if(this.cardIndex.game == 2){this.topCardPos = this.gameViewPos};
        if(this.cardIndex.boring == 2){this.topCardPos = this.boringViewPos};
    }


    Resume.prototype.render = function() {
        this.spec = [];

        this.spec.push({
            transform: Matrix.translate(this.gameViewPos.get(), 0, this.cardIndex.game * 1000),
            opacity: _getOpacityOfCard(this.gameViewPos.get()),
            target: this.gameView.render()
        });

        this.spec.push({
            transform: Matrix.translate(this.boringViewPos.get(), 0, this.cardIndex.boring * 1000),
            opacity: _getOpacityOfCard(this.boringViewPos.get()),
            target: this.boringView.render()
        });

        this.spec.push({
            transform: Matrix.translate(this.mainViewPos.get(), 0, this.cardIndex.main * 1000),
            opacity: _getOpacityOfCard(this.mainViewPos.get()),
            target: this.mainView.render()
        });

        return this.spec;
    };


    function _getOpacityOfCard(pos){
        return 1/(Math.abs(pos)/640 + 1);
    }

    module.exports = Resume;
});