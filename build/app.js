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


Famous(function(require,exports,module){
        //includes Famous
        var Engine = require("famous/Engine");
        var Modifier = require("famous/Modifier");
        var Transform = require("famous/Transform");
        //var Resume = require("app/views/Resume");
        var GameView        = require("app/views/Game");

        //create the new one
        var context = Engine.createContext();
        context.setPerspective(10000);

        var game = new GameView();
        

         //scale the window
        var scaleY = window.innerHeight / 960;
        var scaleX = window.innerWidth / 640;
        var scale = Math.min(scaleX, scaleY);

        var newSize = [640 * scale, 960 * scale];
        var offsetX = (640 - newSize[0])*0.25;

        var offsetMatrix = Transform.move(
            Transform.scale(scale, scale,1),
            [offsetX, 0]
        );

        context.add(new Modifier({
            origin: [0,0],
            size: [window.innerWidth, window.innerHeight],
            transform: offsetMatrix
        })).add(game);

});

