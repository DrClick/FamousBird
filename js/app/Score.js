    define(function(require, exports, module) {
    "use strict";
	//Includes Famous Repositories
    var Surface     = require('famous/core/Surface');

    var Modifier    = require("famous/core/Modifier");
    var Transform   = require("famous/core/Transform");
    var Circle      = require("famous/physics/bodies/Circle");
    var View        = require("famous/core/View");

    var AppUtils                = require('app/Util');
    var PhysicsEngineFactory    = require("app/PhysicsEngineFactory");

      
    /** @constructor */
    function Score(options){
        View.apply(this, arguments);
        
        _create.call(this);
    };
    Score.prototype = Object.create(View.prototype); 
    Score.prototype.constructor = Score;
    Score.DEFAULT_OPTIONS = {
        visible: true
    };

    function _create(){
        this.physicsEngine = PhysicsEngineFactory.getEngine();
        this.score = 0;

        this.surface = new Surface({
            size : [100,25],
            classes : ['scorer'].concat(this.options.classes),
            content: '<h1>0</h1>'
        });

        this.modifier = new Modifier({
            transform: Transform.translate(280, 10, 10),
            origin: [.5,.5]
        }); 


        //Create a physical particle. This will be used when a pipe overlaps this particle, 
        //the player will have scored
        this.particle = new Circle({
            mass: 0,
            radius: 5,
            position : [50, 0 , 0],
            velocity : [0,0,0]
        });

        this.add(this.particle).add(this.modifier).add(this.surface)

        this.visible    = this.options.visible;
    }

    Score.prototype.setScore = function(score){
        this.surface.setContent("<h1>" + score + "</h1>");
        AppUtils.pulse(this.modifier);
    };

    Score.prototype.show = function(score){
        this.visible = true;
    };

    Score.prototype.hide = function(score){
        this.visible = false;
    };

    Score.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    }


	module.exports = Score;
});

