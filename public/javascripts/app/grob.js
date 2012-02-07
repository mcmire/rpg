(function() {
  var Grob, ImageSequence, Mappable, assignable, drawable, game, meta, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, drawable = _ref.drawable;

  Mappable = game.Mappable;

  ImageSequence = game.ImageSequence;

  Grob = meta.def('game.Grob', assignable, drawable, Mappable, {
    states: {},
    clone: function() {
      var clone;
      clone = this._super();
      clone.states = game.util.dup(clone.states);
      return clone;
    },
    init: function(imagePath, width, height) {
      this.width = width;
      this.height = height;
      this._super();
      return this.image = game.imageCollection.get(imagePath);
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

  window.scriptLoaded('app/grob');

}).call(this);
