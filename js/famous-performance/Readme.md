Profiler.js
------------

The profiler is a way to catalogue the temporal duration of a block of code.
It functions as a stopwatch, by cataloguing _start_ and _stop_ events, and then analyzes the timestamps in between.

You would use the profiler as follows:

    var Profiler = require('famous-performance/Profiler");
    FamousEngine.pipe(Profiler);

    Profiler.start('foo timer');
    foo();
    Profiler.stop('foo timer');

Notice that we never call `new Profiler()`. Profiler follows the singleton pattern, that way you can require it in multiple places in your codebase, and share the same module.

You can feed Profiler's start and stop functions any string, as long as you are consistent. You can also nest calls Profiler as follows:

    Profiler.start('foobar timer');
    foo();
        Profiler.start('bar timer');
        bar();
        Profiler.stop('bar timer');
    Profiler.stop('foobar timer');

Profiler tracks FPS and the time to execute a frame of Famous javascript code by default. Internally, Profiler catalogues all durations in milliseconds between `start` and `stop` calls using either `Performance.now()` (if available) or `Date.now()`.
Profiler stores a trailing history of durations in a circular buffer. You can change the size of this buffer by calling Profiler's `setBufferSize` method. Profiler can perform some basic statistical operations of this window, like tracking min, max and standard deviation, though these are disabled by default.

Two successive calls can be made to `Profiler.start(key)` without a call to `Profiler.stop(key)`.
In this case, the Profiler will internally call `Profiler.stop(key)`. This is useful for measuring FPS, since there is no browser event for when the rendering of a frame is finished.


ProfilerView.js
------------

ProfilerView is used to visualize the Profiler-analyzed data. Use it with Profiler as follows:

    var ProfilerView = require('famous-performance/ProfilerView');

Then append ProfilerView to the render tree as you would any renderable.

Without any Profiler `start` and `stop` calls, you should still see the view's visualization of FPS and Famo.us javascript runtime duration, as these are profiled by default.
Notice that all stats besides FPS are measured in milliseconds.

ProfilerView accepts an options object as an optional second parameter.
Currently, only one option, `max`, is supported, and that is what the ProfilerView should treat the maximum duration to be in milliseconds.
The default is 1000/16, but it is often helpful to track code that completes on the order of 1ms, and so it is helpful to set the maximum duration down to a few milliseconds.

ProfilerMetric.js
------------

This is an encapsulation of a single tracked metric. It shouldn't be needed at the app.js level.
Edit this code to add statistical analysis methods to a metric.

ProfilerMetricView.js
------------

This is an encapsulation of a single tracked metric's view. It shouldn't be needed at the app.js level.
Edit this code to change the visual representation of a metric in ProfilerView.
