define(function(require, exports, module) {
    var Constraint      = require('famous/physics/constraints/Constraint');
    var Vector          = require('famous/math/Vector');
    var EventHandler    = require('famous/core/EventHandler');
    var Circle          = require('famous/physics/bodies/Circle');
    var Rectangle       = require('famous/physics/bodies/Rectangle');
    var MathUtilities   = require("famous/math/Utilities");

    /** @constructor */
    function Overlap(options){
        this.options = {};
        if (options) this.setOptions(options);

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        //registers
        this.displacement   = new Vector();
        this.normal         = new Vector();
    };

    Overlap.prototype = Object.create(Constraint.prototype);
    Overlap.prototype.constructor = Constraint;

    Overlap.prototype.setOptions = function(options){
        for (var key in options) this.options[key] = options[key];
    };

    Overlap.prototype.applyConstraint = function(particles, source, dt){

        if (source === undefined) return;

        var p1 = _getWorldPosition(source);
        var r1 = source.radius;

        if(source instanceof Rectangle){
            //wrap in circle that hold entire object
            r1 = Math.sqrt(Math.pow(source.size[0]/2, 2) + Math.pow(source.size[1]/2, 2));
        }

        var disp = this.displacement;//the displacement of the two bodies

        //loop through each particle target
        for (var index = 0; index < particles.length; index++){

            var target = particles[index];

            if (source == target) continue;

            var p2 = _getWorldPosition(target);
            var r2 = target.radius;

            //here we need to determine if target is a circle of rectangle. The rectangle
            //will require further processing

            if(target instanceof Rectangle){
                //find the largest dimension of the rectangle and approximate it as a sphere
                r2 = Math.sqrt(Math.pow(target.size[0]/2, 2) + Math.pow(target.size[1]/2, 2));
            }

            //get the displacement of the two particles
            disp.set(p1.sub(p2));
            var dist = disp.norm();

            var overlap = r1 + r2 - dist;//basic circle on circle detection

            if (overlap > 0){//It's a hit (maybe)
                var isHit = true;

                if(target instanceof Rectangle || source instanceof Rectangle){
                    isHit = _DetermineIfOverlapped(source, target);
                }
                
                if(isHit){
                    this.normal.set(disp.normalize()); //n register set
                    var hitData = {target : target, source : source, overlap : overlap, normal : this.normal};
                    this.eventOutput.emit('hit', hitData);
                }//end if hit
            };//end if hit (maybe)
        };//end for each target particle
    };//end function 


    //Recurses up the parent particle chain to get 
    //the final world position
    function _getWorldPosition(particle){
        if(!particle.parentParticle) return particle.position;
        else{
            var pos = particle.position.clone();
            return pos.add(_getWorldPosition(particle.parentParticle));
        }
    }

    function _DetermineIfOverlapped (source, target){
        
        //For now, a basic implementation that looks at the vertices of the rectangle to see if they intersec

        /*NOTE: http://www.wildbunny.co.uk/blog/2011/04/20/collision-detection-for-dummies/
        is a good place to start when growing this function up.
        */
        
        if(source instanceof target.constructor)
           throw "Only supported for circle on rectangle hot action!"

        var circle      = source instanceof Circle ? source: target;
        var rectangle   = source instanceof Rectangle ? source: target;

        var circlePos = _getWorldPosition(circle);
        var rectanglePos = _getWorldPosition(rectangle);

        var circ = {
            x: circlePos.x, 
            y: circlePos.y, 
            r: circle.radius
        };

        var rect = {
            x: rectanglePos.x, 
            y: rectanglePos.y, 
            width: rectangle.size[0], 
            height: rectangle.size[1]
        };

        // Find the closest point to the circle within the rectangle
        var closestX = MathUtilities.clamp(circ.x, [rect.x - rect.width/2, rect.x + rect.width/2]);
        var closestY = MathUtilities.clamp(circ.y, [rect.y - rect.height/2, rect.y + rect.height/2]);

        // Calculate the distance between the circle's center and this closest point
        var distanceX = circ.x - closestX;
        var distanceY = circ.y - closestY;

        // If the distance is less than the circle's radius, an intersection occurs
        var distanceSquared = Math.pow(distanceX,2) + Math.pow(distanceY,2);


        var overlapped = distanceSquared < Math.pow(circ.r,2);
        return overlapped;

    }

    module.exports = Overlap;

});
