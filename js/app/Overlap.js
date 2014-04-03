define(function(require, exports, module) {
    var Constraint = require('famous/physics/constraints/Constraint');
    var Vector = require('famous/math/Vector');
    var EventHandler = require('famous/core/EventHandler');
    var Circle = require('famous/physics/bodies/Circle');
    var Rectangle = require('famous/physics/bodies/Rectangle');
    var FamousMath = require("famous/math/Utilities");

    var CircleName = Circle.prototype.constructor.name;
    var RectangleName = Rectangle.prototype.constructor.name;
    

    /** @constructor */
    function Overlap(opts){
        this.opts = {};
        if (opts) this.setOpts(opts);

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        //registers
        this.displacement   = new Vector();
        this.normal         = new Vector();

    };

    Overlap.prototype = Object.create(Constraint.prototype);
    Overlap.prototype.constructor = Constraint;

    Overlap.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    Overlap.prototype.applyConstraint = function(particles, source, dt){

        if (source === undefined) return;

        var p1 = source.position;
        var r1 = source.radius;

        var sourceType = source.constructor.name;

        if(sourceType == RectangleName){
            //wrap in circle that hold entire object
            debugger
            r1 = Math.sqrt(Math.pow(source.size[0]/2, 2) + Math.pow(source.size[1]/2, 2));
        }


        var disp = this.displacement;//the displacement of the two bodies

        //loop through each particle target
        for (var index = 0; index < particles.length; index++){

            var target = particles[index];

            if (source == target) continue;

            var p2 = target.position;
            var r2 = target.radius;


            //here we need to determine if target is a circle of rectangle. The rectangle
            //will require further processing
            
            var targetType = target.constructor.name;
            if(targetType == RectangleName){
                //find the largest dimension of the rectangle and approximate it as a sphere
                r2 = Math.sqrt(Math.pow(target.size[0]/2, 2) + Math.pow(target.size[1]/2, 2));
            }

            //get the displacement of the two particles
            disp.set(p1.sub(p2));
            var dist = disp.norm();

            var overlap = r1 + r2 - dist;//basic circle on circle detection

            if (overlap > 0){//It's a hit (maybe)
                var isHit = true;

                if(targetType == RectangleName || sourceType == RectangleName){
                    isHit = DetermineIfOverlapped(source, target);
                }
                
                if(isHit){
                    this.normal.set(disp.normalize()); //n register set
                    var hitData = {target : target, source : source, overlap : overlap, normal : this.normal};
                    
                    this.eventOutput.emit('hit', hitData);
                }//end if hit
            };//end if hit (maybe)
        };//end for each target particle
    };//end function 

    var DetermineIfOverlapped = function(source, target){   
        
        //For now, a basic implementation that looks at the vertices of the rectangle to see if they intersec

        /*NOTE: http://www.wildbunny.co.uk/blog/2011/04/20/collision-detection-for-dummies/
        is a good place to start when growing this function up.
        */
        
        if(source.constructor.name == target.constructor.name) 
           throw "Only supported for circle on rectangle hot action!"


        debugger

        var circle      = source.constructor.name == CircleName ? source: target;
        var rectangle   = source.constructor.name == RectangleName ? source: target;

        

        var circ = {
            x: circle.position.x, 
            y: circle.position.y, 
            r: circle.radius
        };

        var rect = {
            x: rectangle.position.x, 
            y: rectangle.position.y, 
            width: rectangle.size[0], 
            height: rectangle.size[1]
        };



        // Find the closest point to the circle within the rectangle
        var closestX = FamousMath.clamp(circ.x, [rect.x - rect.width/2, rect.x + rect.width/2]);
        var closestY = FamousMath.clamp(circ.y, [rect.y - rect.height/2, rect.y + rect.height/2]);

        // Calculate the distance between the circle's center and this closest point
        var distanceX = circ.x - closestX;
        var distanceY = circ.y - closestY;

        // If the distance is less than the circle's radius, an intersection occurs
        var distanceSquared = Math.pow(distanceX,2) + Math.pow(distanceY,2);


        var overlapped = distanceSquared < Math.pow(circ.r,2);
        return overlapped;

    };

    module.exports = Overlap;

});
