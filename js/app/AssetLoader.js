define(function(require, exports, module){

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
			return _get(asset).then(function(){
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
	    // Do the usual XHR stuff
	    var req = new XMLHttpRequest();
	    req.open('GET', url);

	    req.onload = function() {
	      // This is called even on 404 etc
	      // so check the status
	      if (req.status == 200) {
	        // Resolve the promise with the response text
	        resolve(req.response);
	      }
	      else {
	        // Otherwise reject with the status text
	        // which will hopefully be a meaningful error
	        reject(Error(req.statusText));
	      }
	    };

	    // Handle network errors
	    req.onerror = function() {
	      reject(Error("Network Error"));
	    };

	    // Make the request
	    req.send();
	  });
	}

	module.exports = new AssetLoader();

});