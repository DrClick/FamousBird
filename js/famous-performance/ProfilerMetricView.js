define(function(require, exports, module) {
    var FamousSurface = require('famous/Surface');
    var FM = require('famous/Matrix');

    function PerformanceMetricView(metric, opts){
        this.opts = {
            size    : [100, 20],
            label   : '',
            map     : function(val){return 60 * val / 1000}
        };

        if (opts) this.setOpts(opts);

        this.metric = metric;
        this.createView();
        this.textPadding = 4;
    };

    PerformanceMetricView.prototype.setOpts = function(opts) {
        for (var key in opts) this.opts[key] = opts[key];
    };

    PerformanceMetricView.prototype.createView = function() {
        var metricSurface = new FamousSurface({size : this.opts.size});
        metricSurface.setProperties({
            background : '#3cf'
        });

        var boundingSurface = new FamousSurface({size : this.opts.size});
        boundingSurface.setProperties({
            background : '#36f'
        });

        var textSurface = new FamousSurface({content : this.opts.label.toString()});
        textSurface.setProperties({
            color : 'white',
            textShadow : '0px 0px 2px black',
            lineHeight : this.opts.size[1] + 'px'
        });

        this.boundingSurface = boundingSurface;
        this.metricSurface = metricSurface;
        this.textSurface = textSurface;
    };

    PerformanceMetricView.prototype.render = function(){
        var scaleValue = this.metric.val;
        var scaleFactor = (scaleValue) ? this.opts.map(scaleValue) : 0;

        return {
            size : this.opts.size,
            target : [
                {
                    target : this.boundingSurface.render(),
                    transform : FM.translate(0,0,-0.0001)
                },
                {
                    target : this.metricSurface.render(),
                    transform : FM.scale(scaleFactor, 1, 1)
                },
                {
                    target : this.textSurface.render(),
                    transform : FM.translate(this.opts.size[0] + this.textPadding, 0)
                }
            ]
        };
    };

    module.exports = PerformanceMetricView;

});