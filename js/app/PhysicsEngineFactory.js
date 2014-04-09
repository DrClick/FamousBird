define(function(require, exports, module) {
	var PhysicsEngine = require("famous/physics/PhysicsEngine");

	var physicsEngines = {}

	function _get(namedInstance){
		var instance = namedInstance || "default";
		if(!physicsEngines[instance]){
			physicsEngines[instance] = new PhysicsEngine();
		}

		return physicsEngines[instance];
	}

	module.exports = {getEngine: _get};

});