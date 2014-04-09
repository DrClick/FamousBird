/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: david@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

//TODO: consider deprecation
define(function(require, exports, module) {
    var Constraint = require('./Constraint');
    var Vector = require('famous/math/Vector');

    /**
     *  A constraint that keeps a physics body a given distance away from a given
     *  anchor, or another attached body.
     *
     *  @class Rod
     *  @constructor
     *  @extends Constraint
     *  @param options {Object}
     */
    function Rod(options) {
        this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);

        //registers
        this.impulse = new Vector();
        this.disp    = new Vector();

        Constraint.call(this);
    }

    Rod.prototype = Object.create(Constraint.prototype);
    Rod.prototype.constructor = Rod;

    /**
     * @property Rod.DEFAULT_OPTIONS
     * @type Object
     * @protected
     * @static
     */
    Rod.DEFAULT_OPTIONS = {

        /**
         * The location of the anchor
         *
         * @attribute anchor
         * @type Array
         * @optional
         */
        anchor : null,

        /**
         * The amount of distance from the anchor the constraint should enforce
         *
         * @attribute length
         * @type Number
         * @default 0
         */
        length : 0,

        /**
         * The amount of distance from the anchor the constraint should enforce
         *
         * @attribute strength
         * @type Number
         * @default 0
         */
        strength   : 1
    };

    /**
     * Basic options setter
     *
     * @method setOptions
     * @param options {Objects}
     */
    Rod.prototype.setOptions = function setOptions(options) {
        if (!options.anchor) {
            if (options.anchor.position instanceof Vector) this.options.anchor = options.anchor.position;
            if (options.anchor   instanceof Vector)  this.options.anchor = options.anchor;
            if (options.anchor   instanceof Array)  this.options.anchor = new Vector(options.anchor);
        }
        if (options.length !== undefined) this.options.length = options.length;
        if (options.strength !== undefined) this.options.strength = options.strength;
    };

    /**
     * Adds a rod impulse to a physics body.
     *
     * @method applyConstraint
     * @param targets {Array.Body} Array of bodies to apply force to.
     * @param source {Body} Not applicable
     * @param dt {Number} Delta time
     */
    Rod.prototype.applyConstraint = function applyConstraint(targets, source, dt) {
        var options         = this.options;
        var disp            = this.disp;
        var impulse         = this.impulse;
        var targetLength    = options.length;
        var strength        = options.strength;
        var anchor          = options.anchor || source.position;

        var particle = targets[0];
        var p = particle.position;

        disp.set(p.sub(anchor));
        var currLength = disp.norm();

        var stretch = (targetLength - currLength) / currLength;

        if (Math.abs(stretch) > 0) {
            impulse.set(disp.mult(stretch * strength / dt));
            particle.applyImpulse(impulse);
            if (source) particle.applyImpulse(impulse.mult(-1));
        }
    };

    module.exports = Rod;
});
