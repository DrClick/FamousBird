define(function(require, exports, module) {

    //add specs here
    var OverlapSpec = require("spec/Overlap.spec");

    OverlapSpec.run();

    //boiler plate code for Jasmine

    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
    };

    var currentWindowOnload = window.onload;

    window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    execJasmine();
    };

    function execJasmine() {
        jasmineEnv.execute();
    }
});
     
