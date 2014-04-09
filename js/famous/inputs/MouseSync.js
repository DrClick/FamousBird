/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');

    /**
     * Handles piped in mouse drag events.
     *   Emits 'start', 'update', and 'end' events with payloads including:
     *   clientX, clientY, offsetX, offsetY: passthroughs from DOM event;
     *   delta: change since last position
     *   position: accumulated deltas
     *   velocity: speed of change in pixels per ms
     *   Can be used as delegate of GenericSync.
     *
     *   (Note: Prefer constructor pattern MouseSync(options) over MouseSync(legacyGetter, options))
     * @class MouseSync
     * @constructor
     * @param {function} [legacyGetter] deprecated position provider function
     * @param {Object} [options] options default overrides.  See setOptions()
     */
    function MouseSync(legacyGetter, options) {
        if (arguments.length === 2){
            this._legacyPositionGetter = arguments[0];
            options = arguments[1];
        }
        else {
            this._legacyPositionGetter = null;
            options = arguments[0];
        }

        this.options =  {
            direction: undefined,
            rails: false,
            scale: 1,
            stallTime: 50,
            propogate: true  //events piped to document on mouseleave
        };

        this._payload = {
            delta    : null,
            position : null,
            velocity : null,
            clientX  : undefined,
            clientY  : undefined,
            offsetX  : undefined,
            offsetY  : undefined
        };

        if (options) this.setOptions(options);
        else this.setOptions(this.options);

        this.input = new EventHandler();
        this.output = new EventHandler();

        EventHandler.setInputHandler(this, this.input);
        EventHandler.setOutputHandler(this, this.output);

        this._prevCoord = undefined;
        this._prevTime = undefined;
        this._prevVel = undefined;

        this.input.on('mousedown', _handleStart.bind(this));
        this.input.on('mousemove', _handleMove.bind(this));
        this.input.on('mouseup', _handleEnd.bind(this));

        if (this.options.propogate) this.input.on('mouseleave', _handleLeave.bind(this));
        else this.input.on('mouseleave', _handleEnd.bind(this));
    }

    /** @const */ MouseSync.DIRECTION_X = 0;
    /** @const */ MouseSync.DIRECTION_Y = 1;

    function _clearPayload() {
        var payload = this._payload;
        payload.delta    = null;
        payload.position = null;
        payload.velocity = null;
        payload.clientX  = undefined;
        payload.clientY  = undefined;
        payload.offsetX  = undefined;
        payload.offsetY  = undefined;
    }

    function _handleStart(event) {
        event.preventDefault(); // prevent drag
        _clearPayload.call(this);

        var x = event.clientX;
        var y = event.clientY;

        this._prevCoord = [x, y];
        this._prevTime = Date.now();
        this._prevVel = (this.options.direction !== undefined) ? 0 : [0, 0];

        var payload = this._payload;
        payload.clientX = x;
        payload.clientY = y;
        payload.offsetX = event.offsetX;
        payload.offsetY = event.offsetY;

        this.output.emit('start', payload);
    }

    function _handleMove(event) {
        if (!this._prevCoord) return;

        var prevCoord = this._prevCoord;
        var prevTime = this._prevTime;

        var x = event.clientX;
        var y = event.clientY;

        var currCoord = [x, y];

        var currTime = Date.now();

        var diffX = currCoord[0] - prevCoord[0];
        var diffY = currCoord[1] - prevCoord[1];

        if (this.options.rails) {
            if (Math.abs(diffX) > Math.abs(diffY)) diffY = 0;
            else diffX = 0;
        }

        var diffTime = Math.max(currTime - prevTime, 8); // minimum tick time

        var velX = diffX / diffTime;
        var velY = diffY / diffTime;

        var scale = this.options.scale;
        var prevPos;
        var nextPos;
        var nextVel;
        var nextDelta;

        if (this.options.direction === MouseSync.DIRECTION_X) {
            prevPos = this._legacyPositionGetter ? this._legacyPositionGetter() : 0;
            nextDelta = scale * diffX;
            nextPos = prevPos + nextDelta;
            nextVel = scale * velX;
        }
        else if (this.options.direction === MouseSync.DIRECTION_Y) {
            prevPos = this._legacyPositionGetter ? this._legacyPositionGetter() : 0;
            nextDelta = scale * diffY;
            nextPos = prevPos + nextDelta;
            nextVel = scale * velY;
        }
        else {
            prevPos = this._legacyPositionGetter ? this._legacyPositionGetter() : [0,0];
            nextDelta = [scale * diffX, scale * diffY];
            nextPos = [prevPos[0] + nextDelta[0], prevPos[1] + nextDelta[1]];
            nextVel = [scale * velX, scale * velY];
        }

        var payload = this._payload;
        payload.delta    = nextDelta;
        payload.position = nextPos;
        payload.velocity = nextVel;
        payload.clientX  = x;
        payload.clientY  = y;
        payload.offsetX  = event.offsetX;
        payload.offsetY  = event.offsetY;

        this.output.emit('update', payload);

        this._prevCoord = currCoord;
        this._prevTime = currTime;
        this._prevVel = nextVel;
    }

    function _handleEnd(event) {
        if (!this._prevCoord) return;

        var prevTime = this._prevTime;
        var currTime = Date.now();

        if (currTime - prevTime > this.options.stallTime)
            this._prevVel = (this.options.direction === undefined) ? [0, 0] : 0;

        var payload = this._payload;
        payload.velocity = this._prevVel;
        payload.clientX  = event.clientX;
        payload.clientY  = event.clientY;
        payload.offsetX  = event.offsetX;
        payload.offsetY  = event.offsetY;

        this.output.emit('end', payload);

        this._prevCoord = undefined;
        this._prevTime = undefined;
        this._prevVel = undefined;
    }

    // handle 'mouseup' and 'mousemove'
    function _handleLeave(event) {
        if (!this._prevCoord) return;

        var boundMove = _handleMove.bind(this);
        var boundEnd = function(event) {
            _handleEnd.call(this, event);
            document.removeEventListener('mousemove', boundMove);
            document.removeEventListener('mouseup', boundEnd);
        }.bind(this);

        document.addEventListener('mousemove', boundMove);
        document.addEventListener('mouseup', boundEnd);
    }

    /**
     * Return entire options array, including defaults.
     *
     * @method getOptions
     * @return {Object} configuration options
     */
    MouseSync.prototype.getOptions = function getOptions() {
        return this.options;
    };

    /**
     * Set internal options, overriding any default options
     *
     * @method setOptions
     *
     * @param {Object} [options] overrides of default options
     * @param {Number} [options.direction] Pay attention to x changes (MouseSync.DIRECTION_X),
     *   y changes (MouseSync.DIRECTION_Y) or both (undefined)
     * @param {boolean} [options.rails] whether to snap position calculations to nearest axis
     * @param {Number | Array.Number} [options.scale] scale outputs by scalar or pair of scalars
     * @param {Number} [options.stallTime] reset time for velocity calculation in ms
     * @param {Boolean} [options.propogate] whether events are piped to document on mouseleave
     */
    MouseSync.prototype.setOptions = function setOptions(options) {
        if (options.direction !== undefined) this.options.direction = options.direction;
        if (options.rails !== undefined) this.options.rails = options.rails;
        if (options.scale !== undefined) this.options.scale = options.scale;
        if (options.stallTime !== undefined) this.options.stallTime = options.stallTime;
        if (options.propogate !== undefined) this.options.propogate = options.propogate;
    };

    module.exports = MouseSync;
});
