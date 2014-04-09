/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: david@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var Vector = require('famous/math/Vector');
    var Transform = require('famous/core/Transform');
    var EventHandler = require('famous/core/EventHandler');
    var Integrator = require('../integrators/SymplecticEuler');

    /**
     * A point body that is controlled by the Physics Engine. A particle has
     * position and velocity states that are updated by the Physics Engine.
     * Ultimately, a particle is a _special type of modifier, and can be added to
     * the Famous render tree like any other modifier.
     *
     * @constructor
     * @class Particle
     * @uses EventHandler
     * @uses Modifier
     * @extensionfor Body
     */
     function Particle(options) {
        options = options || {};

        // registers
        this.position = new Vector();
        this.velocity = new Vector();
        this.force    = new Vector();

        var defaults  = Particle.DEFAULT_OPTIONS;

        // set vectors
        this.setPosition(options.position || defaults.position);
        this.setVelocity(options.velocity || defaults.velocity);
        this.force.set(options.force || [0,0,0]);

        // set scalars
        this.mass = (options.mass !== undefined)
            ? options.mass
            : defaults.mass;

        this.axis = (options.axis !== undefined)
            ? options.axis
            : defaults.axis;

        this.inverseMass = 1 / this.mass;

        // state variables
        this._isSleeping     = false;
        this._engine         = null;
        this._eventOutput    = null;
        this._positionGetter = null;

        this.transform = Transform.identity.slice();

        // cached _spec
        this._spec = {
            transform : this.transform,
            target    : null
        };
    }

    /**
     * @property Particle.DEFAULT_OPTIONS
     * @type Object
     * @protected
     * @static
     */
    Particle.DEFAULT_OPTIONS = {

        /**
         * The position of the particle
         * @attribute position
         * @type Array
         */
        position : [0,0,0],

        /**
         * The velocity of the particle
         * @attribute velocity
         * @type Array
         */
        velocity : [0,0,0],

        /**
         * The mass of the particle
         * @attribute mass
         * @type Number
         */
        mass : 1,

        /**
         * The axis a particle can move along. Can be bitwise ORed
         *    e.g., Particle.AXES.X, Particle.AXES.X | Particle.AXES.Y
         * @attribute axis
         * @type Hexadecimal
         */
        axis : undefined
    };

    /**
     * Kinetic energy threshold needed to update the body
     *
     * @property SLEEP_TOLERANCE
     * @type Number
     * @static
     * @default 1e-7
     */
    Particle.SLEEP_TOLERANCE = 1e-7;

    /**
     * Axes by which a body can translate
     *
     * @property AXES
     * @type Hexadecimal
     * @static
     * @default 1e-7
     */
    Particle.AXES = {
        X : 0x00, // hexadecimal for 0
        Y : 0x01, // hexadecimal for 1
        Z : 0x02  // hexadecimal for 2
    };

    // Integrator for updating the particle's state
    Particle.INTEGRATOR = new Integrator();

    //Catalogue of outputted events
    var _events = {
        start  : 'start',
        update : 'update',
        end    : 'end'
    };

    // Cached timing function
    var now = (function() {
        return Date.now;
    })();

    Particle.prototype.sleep = function sleep() {
        if (this._isSleeping) return;
        this.emit(_events.end, this);
        this._isSleeping = true;
    };

    Particle.prototype.wake = function wake() {
        if (!this._isSleeping) return;
        this.emit(_events.start, this);
        this._isSleeping = false;
        this._prevTime = now();
    };

    /**
     * @attribute isBody
     * @type Boolean
     * @static
     */
    Particle.prototype.isBody = false;

    Particle.prototype.setPosition = function setPosition(p) {
        this.position.set(p);
    };

    Particle.prototype.setPosition1D = function(x) {
        this.position.x = x;
    };

    /**
     * Basic getter function for position Vector
     * @name Particle#getPos
     * @function
     */
    Particle.prototype.getPosition = function getPosition() {
        if (this._positionGetter instanceof Function)
            this.setPosition(this._positionGetter());

        this._engine.step();

        return this.position.get();
    };

    Particle.prototype.getPosition1D = function getPosition1D() {
        this._engine.step();
        return this.position.x;
    };

    Particle.prototype.positionFrom = function positionFrom(_positionGetter) {
        this._positionGetter = _positionGetter;
    };

    /**
     * Basic setter function for velocity Vector
     * @name Particle#setVel
     * @function
     */
    Particle.prototype.setVelocity = function setVelocity(v) {
        this.velocity.set(v);
        this.wake();
    };

    Particle.prototype.setVelocity1D = function(x) {
        this.velocity.x = x;
        this.wake();
    };

    /**
     * Basic getter function for velocity Vector
     * @name Particle#getVel
     * @function
     */
    Particle.prototype.getVelocity = function getVelocity() {
        return this.velocity;
    };

    Particle.prototype.getVelocity1D = function getVelocity1D() {
        return this.velocity.x;
    };

    /**
     * Basic setter function for mass quantity
     * @name Particle#setMass
     * @function
     */
    Particle.prototype.setMass = function setMass(m) {
        this.mass = m;
        this.inverseMass = 1 / m;
    };

    /**
     * Basic getter function for mass quantity
     * @name Particle#getMass
     * @function
     */
    Particle.prototype.getMass = function getMass() {
        return this.mass;
    };

    /**
     * Set position, velocity, force, and accel Vectors each to (0, 0, 0)
     * @name Particle#reset
     * @function
     */
    Particle.prototype.reset = function reset(p,v) {
        p = p || [0,0,0];
        v = v || [0,0,0];
        this.setPosition(p);
        this.setVelocity(v);
    };

    /**
     * Add force Vector to existing internal force Vector
     * @name Particle#applyForce
     * @function
     */
    Particle.prototype.applyForce = function applyForce(force) {
        if (force.isZero()) return;
        this.force.add(force).put(this.force);
        this.wake();
    };

    /**
     * Add impulse (force*time) Vector to this Vector's velocity.
     * @name Particle#applyImpulse
     * @function
     */
    Particle.prototype.applyImpulse = function applyImpulse(impulse) {
        if (impulse.isZero()) return;
        var velocity = this.velocity;
        velocity.add(impulse.mult(this.inverseMass)).put(velocity);
    };

    Particle.prototype.integrateVelocity = function integrateVelocity(dt) {
        Particle.INTEGRATOR.integrateVelocity(this, dt);
    };

    Particle.prototype.integratePosition = function integratePosition(dt) {
        Particle.INTEGRATOR.integratePosition(this, dt);
    };

    Particle.prototype._integrate = function _integrate(dt) {
        this.integrateVelocity(dt);
        this.integratePosition(dt);
    };

    Particle.prototype.step = function step() {
        if (this.getEnergy() < Particle.SLEEP_TOLERANCE) {
            this.sleep();
            return;
        }

        if (!this._prevTime) this._prevTime = now();

        var _currTime = now();
        var dtFrame = _currTime - this._prevTime;
        this._prevTime = _currTime;
        if (dtFrame < 8) return;
        this._integrate.call(this, dtFrame);
        this.emit(_events.update, this);
    };

    /**
     * Get kinetic energy of the particle.
     * @name Particle#getEnergy
     * @function
     */
    Particle.prototype.getEnergy = function getEnergy() {
        return 0.5 * this.mass * this.velocity.normSquared();
    };

    /**
     * Generate current positional transform from position (calculated)
     *   and rotation (provided only at construction time)
     * @name Particle#getTransform
     * @function
     */
    Particle.prototype.getTransform = function getTransform() {
        this._engine.step();

        var position = this.position;
        var axis = this.axis;
        var transform = this.transform;

        if (axis !== undefined) {
            if (axis & ~Particle.AXES.X) {
                position.x = 0;
            }
            if (axis & ~Particle.AXES.Y) {
                position.y = 0;
            }
            if (axis & ~Particle.AXES.Z) {
                position.z = 0;
            }
        }

        transform[12] = position.x;
        transform[13] = position.y;
        transform[14] = position.z;

        return transform;
    };

    Particle.prototype.modify = function modify(target) {
        var _spec = this._spec;
        _spec.transform = this.getTransform();
        _spec.target = target;
        return _spec;
    };

    Particle.prototype.emit = function emit(type, data) {
        if (!this._eventOutput) return;
        this._eventOutput.emit(type, data);
    };

    function _createEventOutput() {
        this._eventOutput = new EventHandler();
        this._eventOutput.bindThis(this);
        EventHandler.setOutputHandler(this, this._eventOutput);
    }

    Particle.prototype.on = function on() {
        _createEventOutput.call(this);
        return this.on.apply(this, arguments);
    };
    Particle.prototype.removeListener = function removeListener() {
        _createEventOutput.call(this);
        return this.removeListener.apply(this, arguments);
    };
    Particle.prototype.pipe = function pipe() {
        _createEventOutput.call(this);
        return this.pipe.apply(this, arguments);
    };
    Particle.prototype.unpipe = function unpipe() {
        _createEventOutput.call(this);
        return this.unpipe.apply(this, arguments);
    };

    module.exports = Particle;
});
