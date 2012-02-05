(function() {
  var Bounds, Grob, ImageSequence, Mappable, assignable, drawable, game, images, meta, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, drawable = _ref.drawable;

  Mappable = game.Mappable;

  images = game.images.images;

  Bounds = game.Bounds;

  ImageSequence = game.ImageSequence;

  Grob = meta.def('game.Grob', assignable, drawable, Mappable, {
    clone: function() {
      var clone;
      clone = this._super();
      clone.states = {};
      return clone;
    },
    init: function(imagePath, width, height) {
      this.width = width;
      this.height = height;
      return this.image = images[imagePath];
    },
    predraw: function() {
      var fn;
      if (fn = this.currentState.handler) {
        if (typeof fn === 'function') {
          return this.fn();
        } else {
          return this[fn]();
        }
      }
    },
    draw: function() {
      var biv;
      biv = this.bounds.inViewport;
      return this.currentState.sequence.draw(this.ctx, biv.x1, biv.y1);
    },
    addState: function(name, frameIndices, opts) {
      var state;
      if (opts == null) opts = {};
      state = {};
      state.name = name;
      state.handler = opts.handler;
      state.onEnd = opts.then || name;
      state.sequence = ImageSequence.create(this.image, this.width, this.height, frameIndices, {
        frameDelay: opts.frameDelay,
        frameDuration: opts.frameDuration,
        doesRepeat: opts.doesRepeat
      });
      state.sequence.onEnd(state.onEnd);
      return this.states[name] = state;
    },
    setState: function(name) {
      this.currentState = this.states[name];
      if (!this.currentState) throw new Error("Unknown state '" + name + "'!");
      return this.currentState;
    },
    inspect: function() {
      return JSON.stringify({
        "bounds.inViewport": this.bounds.inViewport.inspect(),
        "bounds.onMap": this.bounds.onMap.inspect()
      });
    },
    debug: function() {
      console.log("bounds.inViewport = " + (this.bounds.inViewport.inspect()));
      return console.log("bounds.OnMap = " + (this.bounds.onMap.inspect()));
    }
  });

  game.Grob = Grob;

  window.numScriptsLoaded++;

}).call(this);
