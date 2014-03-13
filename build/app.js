//  CodePen Evaluation License
//  
//  Copyright (c) 2013 Famous Industries, Inc.
//  
//  Non-sublicensable permission is hereby granted, free of charge, to any person obtaining a 
//  copy of this software and associated documentation files directly from codepen.io (the 
//  "Software"), solely to internally make and internally use copies of the Software to test, 
//  explore, and evaluate the Software solely in such personâ€™s non-commercial, non-
//  production environments, provided that the above copyright notice and this permission 
//  notice shall be included in all copies or substantial portions of the Software. 
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
//  MERCHANTABILITY, FITNESS FOR A ARTICULAR PURPOSE AND 
//  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
//  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR 
//  IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
//  SOFTWARE.
//


Famous(function(require,exports,module)
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
        })).link(ProfilerView);

        context.add(new Modifier({
            origin : [.5,.5],
            transform: Transform.scale(scale,scale,1)
        })).link(resume);
        //That was easy!!!

});

