define(function(require, exports, module) {
        //includes Famous
        var Engine = require('famous/Engine');
        var Modifier = require("famous/Modifier");
        var Matrix = require("famous/Matrix");
        var Resume = require("app/Resume");

        //instantiate a new resume        
        var resume = new Resume();

        //create the new one
        var context = Engine.createContext();

        
        //loads the main view into the context     
        context.add(resume);


        //That was easy!!!

});

