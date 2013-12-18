define(function(require, exports, module) {
    var PerformanceMetric = require('famous-performance/ProfilerMetric');
    var EventHandler = require('famous/EventHandler');

    var bufferSize = 20;
    var metrics = {};
    var eventHandler = new EventHandler();

    function start(id){
        var metric = (metrics[id] === undefined)
            ? addMetric(id)
            : metrics[id];
        metric.start();
    };

    function stop(id){
        metrics[id].stop();
    };

    function addMetric(id){
        var metric = new PerformanceMetric(bufferSize, id);
        metrics[id] = metric;
        return metric;
    };

    function setBufferSize(N){
        bufferSize = N;
        for (var key in metrics) metrics[key].setBufferSize(N);
    };

    function getBufferSize(){
        return bufferSize;
    };

    function emit(type, event){
        eventHandler.emit(type, event)
    };

    eventHandler.on('prerender', function(){
        start('FPS');
        start('Famous');
    });

    eventHandler.on('postrender', function(){
        stop('Famous');
        for (var key in metrics) metrics[key].reset();
    });

    module.exports = {
        metrics : metrics,
        start : start,
        stop : stop,
        emit : emit,
        setBufferSize : setBufferSize,
        getBufferSize : getBufferSize
    };

});