(function() {
  var Block, Grob, drawable, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  Block = game.Block;

  drawable = game.roles.drawable;

  Grob = Block.cloneAs('game.Grob').extend(drawable, {
    states: {},
    clone: function() {
      var clone;
      clone = this._super();
      clone.states = game.util.dup(clone.states);
      return clone;
    },
    init: function(imagePath, width, height) {
      this._super(width, height);
      this.image = game.imageCollection.get(imagePath);
      return this;
    },
    activate: function() {},
    deactivate: function() {},
    predraw: function(ctx) {
      var biv, fn;
      biv = this.bounds.inViewport;
      this.currentState.sequence.clear(ctx, biv.x1, biv.y1);
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
      var b;
      b = this.bounds.onMap;
      return this.currentState.sequence.draw(ctx, b.x1, b.y1);
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
    _initBoundsOnMap: function() {
      this._initFence();
      return this._super();
    },
    _initFence: function() {
      return this.fence = game.Bounds.rect(0, 0, this.map.width, this.map.height);
    }
  });

  game.Grob = Grob;

  window.scriptLoaded('app/grob');

}).call(this);
