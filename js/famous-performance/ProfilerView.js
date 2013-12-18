define(function(require, exports, module) {
    var PerformanceMetricView = require('famous-performance/ProfilerMetricView');
    var Profiler = require('famous-performance/Profiler')
    var FamousCombiner = require('famous/RenderNode');
    var FT = require('famous/Modifier');
    var FM = require('famous/Matrix');

    var max = 1000 / 60;
    var metrics = Profiler.metrics;
    var combiner = new FamousCombiner();
    var counter = 0;

    var size = [150, 20];
    var margin = 1;

    function setMax(max){
        max = max;
    };

    function setSize(size){
        size = size;
    };

    function init(){
        var ty = 0;
        var map;
        for (var key in metrics){
            if (key.toUpperCase() === 'FPS') map = function(val){return 1000 / (60 * val)}
            else map = function(val){return val / max}

            var metricView = new PerformanceMetricView(metrics[key], {
                size    : size,
                label   : key,
                map     : map
            });

            var layoutTransform = new FT(FM.translate(0, ty));
            combiner.add(layoutTransform).link(metricView);
            ty += size[1] + margin;
        };
    };

    function render(){
        if (counter >  2)   return combiner.render();
        if (counter == 2)   init();
        if (counter <= 2)   counter++;
    };


    module.exports = {
        setMax : setMax,
        setSize : setSize,
        render : render
    };

});