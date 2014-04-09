define(function(require, exports, module) {
    var Entity = require('famous/core/Entity');
    var Group = require('famous/core/Group');
    var OptionsManager = require('famous/core/OptionsManager');
    var Transform = require('famous/core/Transform');
    var Utility = require('famous/utilities/Utility');
    var ViewSequence = require('famous/core/ViewSequence');
    var EventHandler = require('famous/core/EventHandler');

    function Scroller(options) {
        this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this._optionsManager.setOptions(options);

        this._node = null;
        this._position = 0;

        // used for shifting nodes
        this._positionOffset = 0;

        this._positionGetter = null;
        this._outputFunction = null;
        this._masterOutputFunction = null;
        this.outputFrom();

        this._onEdge = 0; // -1 for top, 1 for bottom

        this.group = new Group();
        this.group.add({render: _innerRender.bind(this)});

        this._entityId = Entity.register(this);
        this._size = [undefined, undefined];
        this._contextSize = [undefined, undefined];

        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();

        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);
    }

    Scroller.DEFAULT_OPTIONS = {
        direction: Utility.Direction.Y,
        margin: 0,
        clipSize: undefined
    };

    function _sizeForDir(size) {
        if (!size) size = this._contextSize;
        var dimension = (this.options.direction === Utility.Direction.X) ? 0 : 1;
        return (size[dimension] === undefined) ? this._contextSize[dimension] : size[dimension];
    }

    function _output(node, offset, target) {
        var size = node.getSize ? node.getSize() : this._contextSize;
        var transform = this._outputFunction(offset);
        target.push({transform: transform, target: node.render()});
        return _sizeForDir.call(this, size);
    }

    function _getClipSize() {
        if (this.options.clipSize) return this.options.clipSize;
        else return _sizeForDir.call(this, this._contextSize);
    }

    Scroller.prototype.getOptions = function getOptions() {
        return this._optionsManager.getOptions();
    };

    Scroller.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    Scroller.prototype.onEdge = function onEdge() {
        return this._onEdge;
    };

    Scroller.prototype.outputFrom = function outputFrom(fn, masterFn) {
        if (!fn) {
            fn = function(offset) {
                return (this.options.direction === Utility.Direction.X) ? Transform.translate(offset, 0) : Transform.translate(0, offset);
            }.bind(this);
            if (!masterFn) masterFn = fn;
        }
        this._outputFunction = fn;
        this._masterOutputFunction = masterFn ? masterFn : function(offset) {
            return Transform.inverse(fn(-offset));
        };
    };

    Scroller.prototype.positionFrom = function positionFrom(position) {
        if (position instanceof Function) this._positionGetter = position;
        else if (position && position.get) this._positionGetter = position.get.bind(position);
        else {
            this._positionGetter = null;
            this._position = position;
        }
        if (this._positionGetter) this._position = this._positionGetter.call(this);
    };

    Scroller.prototype.sequenceFrom = function sequenceFrom(node) {
        if (node instanceof Array) node = new ViewSequence({array: node});
        this._node = node;
        this._positionOffset = 0;
    };

    Scroller.prototype.getSize = function getSize(actual) {
        return actual ? this._contextSize : this._size;
    };

    Scroller.prototype.render = function render() {
        if (!this._node) return null;
        if (this._positionGetter) this._position = this._positionGetter.call(this);
        return this._entityId;
    };

    Scroller.prototype.commit = function commit(context) {
        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;

        // reset edge detection on size change
        if (!this.options.clipSize && (size[0] !== this._contextSize[0] || size[1] !== this._contextSize[1])) {
            this._onEdge = 0;
            this._contextSize = size;

            if (this.options.direction === Utility.Direction.X) {
                this._size[0] = _getClipSize.call(this);
                this._size[1] = undefined;
            }
            else {
                this._size[0] = undefined;
                this._size[1] = _getClipSize.call(this);
            }
        }

        var scrollTransform = this._masterOutputFunction(-this._position);

        return {
            transform: Transform.multiply(transform, scrollTransform),
            opacity: opacity,
            origin: origin,
            target: this.group.render()
        };
    };

    function _normalizeState() {
        var nodeSize = _sizeForDir.call(this, this._node.getSize());
        var nextNode = this._node && this._node.getNext ? this._node.getNext() : null;
        while (nextNode && this._position + this._positionOffset >= nodeSize) {
            this._positionOffset -= nodeSize;
            this._node = nextNode;
            nodeSize = _sizeForDir.call(this, this._node.getSize());
            nextNode = this._node && this._node.getNext ? this._node.getNext() : null;
        }
        var prevNode = this._node && this._node.getPrevious ? this._node.getPrevious() : null;
        while (prevNode && this._position + this._positionOffset < 0) {
            var prevNodeSize = _sizeForDir.call(this, prevNode.getSize());
            this._positionOffset += prevNodeSize;
            this._node = prevNode;
            prevNode = this._node && this._node.getPrevious ? this._node.getPrevious() : null;
        }
    }

    function _innerRender() {
        var size = null;
        var position = this._position;
        var result = [];

        this._onEdge = 0;

        var offset = -this._positionOffset;
        var clipSize = _getClipSize.call(this);
        var currNode = this._node;
        while (currNode && offset - position < clipSize + this.options.margin) {
            offset += _output.call(this, currNode, offset, result);
            currNode = currNode.getNext ? currNode.getNext() : null;
        }

        var sizeNode = this._node;
        var nodesSize = _sizeForDir.call(this, sizeNode.getSize());
        if (offset < clipSize) {
            while (sizeNode && nodesSize < clipSize) {
                sizeNode = sizeNode.getPrevious();
                if (sizeNode) nodesSize += _sizeForDir.call(this, sizeNode.getSize());
            }
            sizeNode = this._node;
            while (sizeNode && nodesSize < clipSize) {
                sizeNode = sizeNode.getNext();
                if (sizeNode) nodesSize += _sizeForDir.call(this, sizeNode.getSize());
            }
        }

        var edgeSize = (nodesSize !== undefined && nodesSize < clipSize) ? nodesSize : clipSize;

        if (!currNode && offset - position <= edgeSize) {
            this._onEdge = 1;
            this._eventOutput.emit('edgeHit', {
                position: offset - edgeSize
            });
        }
        else if (!this._node.getPrevious() && position <= 0) {
            this._onEdge = -1;
            this._eventOutput.emit('edgeHit', {
                position: 0
            });
        }

        // backwards
        currNode = (this._node && this._node.getPrevious) ? this._node.getPrevious() : null;
        offset = -this._positionOffset;
        if (currNode) {
            size = currNode.getSize ? currNode.getSize() : this._contextSize;
            offset -= _sizeForDir.call(this, size);
        }

        while (currNode && ((offset - position) > -(_getClipSize.call(this) + this.options.margin))) {
            _output.call(this, currNode, offset, result);
            currNode = currNode.getPrevious ? currNode.getPrevious() : null;
            if (currNode) {
                size = currNode.getSize ? currNode.getSize() : this._contextSize;
                offset -= _sizeForDir.call(this, size);
            }
        }

        _normalizeState.call(this);
        return result;
    }

    module.exports = Scroller;
});
