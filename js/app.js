define(function(require, exports, module) {
        //includes Famous
        var Engine = require("famous/Engine");
        var Modifier = require("famous/Modifier");
        var Transform = require("famous/Transform");
        var Resume = require("app/views/Resume");

        var Profiler = require('famous-performance/Profiler');
        var ProfilerView = require('famous-performance/ProfilerView');
    
        Engine.pipe(Profiler);

        //instantiate a new resume        
        var resume = new Resume();

        //create the new one
        var context = Engine.createContext();

        

         //scale the window
        var scaleX = window.innerHeight / 960;
        var scaleY = window.innerWidth / 640;
        var scale = Math.min(scaleX, scaleY);
        


        context.add(new Modifier({
            origin : [0,0],
            transform: Transform.translate(0,0,10)
        })).add(ProfilerView);

        context.add(new Modifier({
            origin : [.5,.5],
            transform: Transform.scale(scale,scale,1)
        })).add(resume);
        //That was easy!!!

});

