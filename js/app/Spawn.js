define(function(require, exports, module) {
	//famous
	var Timer 	= require("famous/utilities/Timer");

	var Overlap = require("app/Overlap");
	var Cloud 	= require("app/Cloud");
    var Pipe 	= require("app/Pipe");
    var Floor 	= require("app/Floor");


    /**
     *
     *  An extension of game, must be called with a game
     *
     */
    function spawnClouds(){
        if(!this.ended){
            var cloud = this.clouds[this.counters.cloud];
            if(cloud == null){
                cloud = new Cloud(this.physicsEngine);
                this.clouds[this.counters.cloud] = cloud;

                this.surface.add(cloud);
            }//end if cloud not created yet
            else{
                cloud.restart();
            }

            this.counters.cloud = (this.counters.cloud + 1) % this.clouds.length;
        }//end if game not ended
    };//end method

    function spawnPipes(){
        if(!this.ended){
            var pipes = this.pipes[this.counters.pipe % this.pipes.length];
            if(pipes == null){
                pipes = new Pipe(
                    this.physicsEngine,
                    {id:this.counters.pipe + 1}
                );



                //detects overlaps with pipes and the birdie
                var overlap_top = new Overlap();
                overlap_top.on("hit", this.end.bind(this));
                this.physicsEngine.attach(overlap_top, pipes.particles[0], this.birdie.particle);

                var overlap_bottom = new Overlap();
                overlap_bottom.on("hit", this.end.bind(this));
                this.physicsEngine.attach(overlap_bottom, pipes.particles[1], this.birdie.particle);

                //detect overlaps with the upper pipe and the scorer
                var overlapScore = new Overlap();
                overlapScore.on("hit", function(data){this.incrementScore(data);}.bind(this));
                this.physicsEngine.attach(overlapScore, pipes.particles[0], this.scorer.particle);


                this.surface.add(pipes);


                this.pipes[this.counters.pipe % this.pipes.length] = pipes;

            }//end if pipes did not exist
            else{
                pipes.restart({id:this.counters.pipe + 1});
            }

            //incrament the counter
            this.counters.pipe++;
        }//end if game not over
    };//end method

    function spawnFloor(){
        if(!this.ended){
            var floor = this.floor[this.counters.floor];
            if(floor == null){
                var opts = {};
                if (this.counters.floor == 0){opts.initPos = 0;}
                floor = new Floor(this, this.physicsEngine, opts);
                this.floor[this.counters.floor] = floor;

                this.surface.add(floor);
            }//end if floor not created yet
            else{
                floor.restart();
            }


            this.counters.floor = (this.counters.floor + 1) % this.floor.length;
        }//end if game not ended
    };//end method

    function spawn(){
        //Spawn the scene
        this.timers.clouds  = Timer.setInterval(spawnClouds.bind(this),1000);
        this.timers.floor   = Timer.setInterval(spawnFloor.bind(this),1000);
    }//end spawn


    module.exports = {
    	start: spawn,
    	floor: spawnFloor,
    	clouds: spawnClouds,
    	pipes: spawnPipes
    }

});