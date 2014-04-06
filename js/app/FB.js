define(function(require, exports, module) {
    "use strict";

	//shim in facebook API
    requirejs.config({
      shim: {
        'facebook' : {
          exports: 'FB'
        }
      },
      paths: {
        'facebook': '//connect.facebook.net/en_US/all'
      }
    });

    var init = false;

 	function _init(){
 		init = true;
 		require(["facebook"], function(){
	    	FB.init({
		        appId      : '293328470826248',
		        status     : true, // check login status
		        cookie     : true, // enable cookies to allow the server to access the session
		        xfbml      : true  // parse XFBML
			});
	    });
 	}

	function isLoggedIn(callback){
		if(!init) _init();


		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
			    // the user is logged in and has authenticated your
			    // app, and response.authResponse supplies
			    // the user's ID, a valid access token, a signed
			    // request, and the time the access token 
			    // and signed request each expire
			    var uid = response.authResponse.userID;
			    var accessToken = response.authResponse.accessToken;

			    callback({status: true, uid: uid, token: accessToken });
		  	} else if (response.status === 'not_authorized') {
		  		//has not authroized your app
		  		callback({status: false, uid: undefined, token: undefined });
		  	} else {
		    	// the user isn't logged in to Facebook.
		    	callback({status: false, uid: undefined, token: undefined });
		  	}
		});
	}

	function login(success, failure){
		if(!init) _init();


		FB.login(function(response) {
   			if (response.authResponse) {
     			console.log('Welcome!  Fetching your information.... ');
     			FB.api('/me', function(response) {
       				console.log('Good to see you, ' + response.name + '.');
     			});

     			//execute success callback
     			success();
   			} else {
     			console.log('User cancelled login or did not fully authorize.');

     			//execute failure callback
     			failure();
   			}
 		});
	}

	function logout(callback){
		if(!init) _init();

		
		FB.logout(function(response) {
			// user is now logged out
			callback();
		});
	}

	function getFBAPI(){
		if(!init) _init();
		return FB;
	}


	module.exports = {
		init: _init,
		isLoggedIn: isLoggedIn,
		login: login,
		logout: logout,
		FB: getFBAPI
	}
});