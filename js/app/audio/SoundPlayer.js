define(function(require, exports, module) {


    var BufferLoader = require('./BufferLoader'); 

    /**
     * @author Reza Ali http://www.syedrezaali.com/
     */
    function SoundPlayer(urls, callback) { 
        this.context; 
        this.node; 
        this.buffersActive = []; 

        try {    
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            this.bufferLoader = new BufferLoader(this.context, urls, this.setSounds.bind(this));
            this.sounds;
            this.callback = callback || undefined; 
            this.bufferLoader.load();        
        }
        catch(e) {
            console.log('Web Audio API is not supported in this browser');
        }
    }

    SoundPlayer.prototype.setSounds = function(sounds) { 
        this.sounds = sounds;
        if(this.callback != undefined){
            this.callback(); 
        }
    }; 

    SoundPlayer.prototype.isPlaying = function()
    {
        if(this.buffersActive.length > 0){
            return true; 
        }
        else
        {
            return false; 
        }        
    };

    SoundPlayer.prototype.stopPlaying = function()
    {
        var len = this.buffersActive.length; 
        if(len > 0){
            for(var i = 0; i < len; i++)
            {
                var buffer = this.buffersActive[i]; 
                buffer.stop(0.0);             
            }
        }        
    }; 

    SoundPlayer.prototype.getContext = function()
    {
        return this.context; 
    }; 

    SoundPlayer.prototype.addNode = function(node)
    {
        this.node = node; 
    }; 

    SoundPlayer.prototype.playSound = function(i, volume, callback) {
        try{
            debugger
            if(this.context && this.sounds)
            {
                var buffer = this.context.createBufferSource();
                var gain = this.context.createGainNode ? this.context.createGainNode() : this.context.createGain(); 
                gain.gain.value = (typeof volume === 'undefined') ? 0.5 : volume; 
                buffer.buffer = this.sounds[i];
                buffer.connect(gain);
                var lastNode = gain; 
                if(this.node) {                
                    lastNode.connect(this.node); 
                    lastNode = this.node; 
                }

                lastNode.connect(this.context.destination);            
                buffer.noteOn(0);    
                buffer.onended = (function(){
                    var index = this.buffersActive.indexOf(buffer); 
                    if(index !== -1){
                        this.buffersActive.splice(index, 1);                     
                    }
                    if(callback){
                        callback();
                    }          
                }).bind(this, buffer); 
                this.buffersActive.push(buffer);             
            }
        }//end try
        catch(e){
            //so sad... no sound
        }
        
    }; 

    module.exports = SoundPlayer;
}); 