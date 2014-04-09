
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');

    /**
     * A surface containing image content
     *
     * @class ImageSurface
     *
     * @extends Surface
     * @constructor
     */
    function ImageSurface(options) {
        this._imageUrl = undefined;
        Surface.apply(this, arguments);
    }

    ImageSurface.prototype = Object.create(Surface.prototype);
    ImageSurface.prototype.constructor = ImageSurface;
    ImageSurface.prototype.elementType = 'img';
    ImageSurface.prototype.elementClass = 'famous-surface';

    /**
     * @method setContent
     */
    ImageSurface.prototype.setContent = function setContent(imageUrl) {
        this._imageUrl = imageUrl;
        this._contentDirty = true;
    };

    /**
     * @method deploy
     */
    ImageSurface.prototype.deploy = function deploy(target) {
        target.src = this._imageUrl || '';
    };

    /**
     * @method recall
     */
    ImageSurface.prototype.recall = function recall(target) {
        target.src = '';
    };

    module.exports = ImageSurface;
});
