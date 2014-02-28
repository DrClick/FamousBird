define(function(require, exports, module) {
    var Overlap = require('app/Overlap');

    var Spec =  function(){ 
    	describe("Overlap", function() {
        

	        it("should not hit a circle of radius 1 at [0,0] and a rectangle[3,4,0] @ [5,5,0,0]", function() {
	          expect(false).toEqual(true);
	        });
		});
	};

	module.exports = {run: Spec};
});