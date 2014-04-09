/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: david@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var Constraint = require('./Constraint');
    var Vector = require('famous/math/Vector');

    /**
     * @constructor
     * @deprecated
     * */
    function Distance1D(opts) {
        this.opts = {
            length : 0,
            anchor : undefined,
            dampingRatio : 0,
            period : 0
        };

        if (opts) this.setOpts(opts);

        this.impulse  = new Vector();

    }

    Distance1D.prototype = Object.create(Constraint.prototype);
    Distance1D.prototype.constructor = Distance1D;

    Distance1D.prototype.setOpts = function setOpts(opts) {
        for (var key in opts) this.opts[key] = opts[key];
    };

    function calcError(impulse) {
        return impulse.norm();
    }

    Distance1D.prototype.applyConstraint = function applyConstraint(targets, source, dt) {
        var impulse  = this.impulse;
        var diffP; var diffV;

        if (source) {
            var p2 = source.position.x;
            var w2 = source.inverseMass;
            var v2 = source.velocity.x;
        }
        else {
            var p2 = this.opts.anchor;
            var w2 = 0;
        }

        var length = this.opts.length;
        var period = this.opts.period;
        var dampingRatio = this.opts.dampingRatio;
        var err = 0;

        for (var i = 0; i < targets.length; i++) {

            var particle = targets[i];

            var v1 = particle.velocity.x;
            var p1 = particle.position.x;
            var w1 = particle.inverseMass;

            diffP = p1 - p2;

            var dist = diffP - length;

            if (source) diffV = v1 - v2;
            else        diffV = v1;

            var effMass = 1 / (w1 + w2);

            if (period === 0) {
                var gamma = 0;
                var beta = 1;
            }
            else {
                // period /= Math.max(Math.sqrt(1 - dampingRatio*dampingRatio),10000);
                var c = 4 * effMass * Math.PI * dampingRatio / period;
                var k = 4 * effMass * Math.PI * Math.PI / (period*period);

                var gamma = 1 / (c + dt*k);
                var beta  = dt*k / (c + dt*k);
            }

            var antiDrift = beta/dt * dist;
            var lambda    = -(diffV + antiDrift) / (gamma + dt/effMass);

            impulse.setXYZ(dt*lambda, 0, 0);
            particle.applyImpulse(impulse);

            if (source) source.applyImpulse(impulse.mult(-1));

            // err += calcError(impulse);
            err += Math.abs(lambda);

        }

        return err;
    };

    module.exports = Distance1D;
});
