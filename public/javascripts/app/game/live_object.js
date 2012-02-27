(function() {
  var __slice = Array.prototype.slice;

  define('game.LiveObject', function() {
    var LiveObject, StillObject, meta;
    meta = require('meta');
    StillObject = require('game.StillObject');
    LiveObject = StillObject.cloneAs('game.LiveObject').extend({
      states: {},
      clone: function() {
        var clone;
        clone = this._super();
        clone.states = common.util.dup(clone.states);
        return clone;
      },
      predraw: function(ctx) {
        var fn;
        this.currentState.sequence.clear(ctx, this.mbounds.x1, this.mbounds.y1);
        if (fn = this.currentState.handler) {
          if (typeof fn === 'function') {
            this.fn();
          } else {
            this[fn]();
          }
          return this.recalculateViewportBounds();
        }
      },
      draw: function(ctx) {
        return this.currentState.sequence.draw(ctx, this.mbounds.x1, this.mbounds.y1);
      },
      addState: function(name, frameIndices, opts) {
        var seq, state;
        if (opts == null) opts = {};
        state = {};
        state.name = name;
        state.handler = opts["do"];
        state.onEnd = opts.then || name;
        seq = game.ImageSequence.create(this.image, this.width, this.height, frameIndices, {
          frameDelay: opts.frameDelay,
          frameDuration: opts.frameDuration,
          doesRepeat: opts.doesRepeat
        });
        seq.assignTo(this);
        seq.onEnd(state.onEnd);
        state.sequence = seq;
        return this.states[name] = state;
      },
      setState: function(name) {
        this.currentState = this.states[name];
        this.recalculateViewportBounds();
        this.currentState.sequence.reset();
        if (!this.currentState) throw new Error("Unknown state '" + name + "'!");
        return this.currentState;
      },
      translate: function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        (_ref = this.vbounds).translate.apply(_ref, args);
        return this.doToMapBounds.apply(this, ['translate'].concat(__slice.call(args)));
      },
      translateBySide: function(side, value) {
        var axis, distMoved;
        axis = side[0];
        distMoved = this.doToMapBounds('translateBySide', side, value);
        this.vbounds.translate(axis, distMoved);
        return distMoved;
      },
      _initBoundsOnMap: function() {
        this._initFence();
        return this._super();
      },
      _initFence: function() {
        return this.fence = game.Bounds.rect(0, 0, this.map.width, this.map.height);
      }
    });
    return LiveObject;
  });

}).call(this);
