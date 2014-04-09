define(function(require, exports, module){

	var Utils = require("app/Util");

	var EventHandler = require("famous/core/EventHandler");
	
	var _eventInput = new EventHandler();
	var _eventOutput = new EventHandler();

	function AssetLoader(){
		
		//wire up eventing
		
		EventHandler.setInputHandler(this, _eventInput);
		EventHandler.setOutputHandler(this, _eventOutput);
	}

	AssetLoader.prototype.getAssets = function(assets, callback){
		if(!(assets instanceof Array)) {throw "assets must be an array"}

		var numAssets = assets.length;
		var loadedCount = 0.0;

		var promises = assets.map(function(asset){


			if(asset.match(/\.[png,gif,jpg]/)){
				return new Promise(function(resolve, reject) {
		    		var image = new Image();
					image.src = asset;
					resolve();
		  		});
			}


			return _get(asset).then(function(result){
				loadedCount++;
				_eventOutput.emit("asset.loaded", 
					{asset: asset, complete: loadedCount/numAssets});	
			});
		});
		Promise.all(promises).then(callback);
	};

	function _get(url) {
		// Return a new promise.
  		return new Promise(function(resolve, reject) {
    		Utils.get(url, resolve, reject);
  		});
	}

	module.exports = new AssetLoader();

});