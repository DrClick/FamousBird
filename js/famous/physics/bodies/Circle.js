/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: david@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var Body = require('./Body');
    var Matrix = require('famous/math/Matrix');

    /**
     * @class An elemental circle-shaped Body in the physics engine.
     *
     * @description This is a region defined by a radius.
     *    Its size is the dimension of the bounding square.
     *
     *
     * * Class/Namespace TODOs
     *
     * * opts:
     *    * r: radius
     *    * inherited opts from: {@link Body}.
     *
     * @name Circle
     * @extends Body
     * @constructor
     * @example TODO
     */
    function Circle(options) {
        options = options || {};
        this.setRadius(options.radius || 0);
        Body.call(this, options);
    }

    Circle.prototype = Object.create(Body.prototype);
    Circle.prototype.constructor = Circle;

    Circle.prototype.setRadius = function setRadius(r) {
        this.radius = r;
        this.size = [2*this.radius, 2*this.radius];
        this.setMomentsOfInertia();
    };

    Circle.prototype.setMomentsOfInertia = function setMomentsOfInertia() {
        var m = this.mass;
        var r = this.radius;

        this.inertia = new Matrix([
            [0.25 * m * r * r, 0, 0],
            [0, 0.25 * m * r * r, 0],
            [0, 0, 0.5 * m * r * r]
        ]);

        this.inverseInertia = new Matrix([
            [4 / (m * r * r), 0, 0],
            [0, 4 / (m * r * r), 0],
            [0, 0, 2 / (m * r * r)]
        ]);

        this.inverseInertiaTranspose = this.inverseInertia.clone();
    };

    module.exports = Circle;

});
