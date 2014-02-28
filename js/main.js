define(function(require, exports, module) {
        //includes Famous
        var Engine = require("famous/Engine");
        var Modifier = require("famous/Modifier");
        var Matrix = require("famous/Matrix");
        var Resume = require("app/views/Resume");

        //instantiate a new resume        
        var resume = new Resume();

        //create the new one
        var context = Engine.createContext();

        

         //scale the window
        var scaleX = window.innerHeight / 960;
        var scaleY = window.innerWidth / 640;
        var scale = Math.min(scaleX, scaleY);
        context.add(new Modifier({
            origin : [.5,.5],
            transform: Matrix.scale(scale,scale,1)
        })).link(resume);



        //That was easy!!!

});

