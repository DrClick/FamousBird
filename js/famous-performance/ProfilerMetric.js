define(function(require, exports, module) {

    function PerformanceMetric(bufferSize){

        this.bufferSize = bufferSize || 30;
        this.calculateStatistics = false;

        //tracked statistics
        this.val = undefined;
        this.min = 0;
        this.max = 0;
        this.std = 0;

        //internals
        this._index      = 0;
        this._startTime  = 0;
        this._stopped    = true;
        this._startCalls = 0;

        this.accumulator = new Array(this.bufferSize);
        for (var i = 0; i < this.bufferSize; i++) this.accumulator[i] = 0;

    };

    var getTime = (window.performance)
        ? function(){return performance.now()}
        : function(){return Date.now()}

    function getMax(array){
        return Math.max.apply(Math, array);
    };

    function getMin(array){
        return Math.min.apply(Math, array);
    };

    function getAvg(array){
        var N = array.length;
        var sum = 0;
        for (var i = 0; i < N; i++) sum += array[i];
        return sum / N;
    };

    function getSTD(array, avg){
        var sum = 0;
        var meanDiff;
        var N = array.length;
        if (avg === undefined) avg = getAvg(array);
        for (var i = 0; i < N; i++){
            meanDiff = array[i] - avg;
            sum += meanDiff * meanDiff;
        };
        return Math.sqrt(sum / N)
    };

    PerformanceMetric.prototype.start = function(){
        this._startCalls++;
        if (this._stopped){
            this._startTime = getTime();
            this._stopped = false;
        }
        else{
            //run stop if started is run twice consecutively
            this.stop();
            this.start();
        };
    };

    PerformanceMetric.prototype.stop = function(){
        this._stopped = true;
        var duration  = getTime() - this._startTime;
        if (this._startCalls == 1)  this.insert(duration);
        else                        this.addInPlace(duration);
    };

    PerformanceMetric.prototype.aggregate = function(){
        var accumulator = this.accumulator;
        this.val = getAvg(accumulator);
        if (this.calculateStatistics){
            this.min = getMin(accumulator);
            this.max = getMax(accumulator);
            this.std = getSTD(accumulator, this.val);
        };
    };

    PerformanceMetric.prototype.insert = function(val){
        if (this._index === this.bufferSize){
            this.aggregate();
            this._index = 0;
        };
        this.accumulator[this._index] = val;
        this._index++;
    };

    PerformanceMetric.prototype.addInPlace = function(val){
        this.accumulator[this._index - 1] += val;
    };

    PerformanceMetric.prototype.setBufferSize = function(N){
        this.bufferSize = N;
        this.accumulator = new Array(N);
        for (var i = 0; i < N; i++) this.accumulator[i] = 0;
        this._index = 0;
    };

    PerformanceMetric.prototype.reset = function(){
        this._startCalls = 0;
    };

    PerformanceMetric.prototype.dump = function(){
        console.log(this.accumulator);
    };

    module.exports = PerformanceMetric;

});