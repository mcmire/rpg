(function() {
  var Bounds, game,
    __slice = Array.prototype.slice;

  Bounds = (game = window.game).Bounds;

  game.Mob = (function() {

    Mob.extended = function() {
      this.states = {};
      return this.addState = function(name, args) {
        var state;
        state = {};
        state.name = name;
        state.frameDuration = args.duration || args.frameDuration || 1;
        state.frames = args.frames;
        state.numFrames = state.frames.length;
        state.doesRepeat = args.repeat || args.doesRepeat;
        state.afterFinish = args.then;
        state.doesMove = args.move || args.doesMove;
        if (state.moveHandler) {
          state.doesMove = true;
        } else if (state.doesMove) {
          state.moveHandler = name;
        }
        return this.states[name] = state;
      };
    };

    function Mob(main) {
      var _ref;
      this.main = main;
      _ref = this.main, this.viewport = _ref.viewport, this.map = _ref.map, this.collisionLayer = _ref.collisionLayer;
      this.isLoaded = false;
      this.imagePath = "" + this.main.imagesPath + "/" + this.constructor.image;
      this.image = new Image();
      this.image.src = this.imagePath;
      this.width = this.constructor.width;
      this.height = this.constructor.height;
      this.speed = this.constructor.speed;
      this._initBounds();
      this.addEvents();
    }

    Mob.prototype._initBounds = function() {
      this.bounds = {};
      this.lastBounds = {};
      this.bounds.onMap = this.lastBounds.onMap = new Bounds(this.width, this.height);
      this.bounds.inViewport = this.lastBounds.inViewport = new Bounds(this.width, this.height);
      this.initFence();
      this.initTopLeftBoundsOnMap();
      return this.initTopLeftBoundsInViewport();
    };

    Mob.prototype.initTopLeftBoundsOnMap = function() {
      return this.bounds.onMap.anchor(0, 0);
    };

    Mob.prototype.initTopLeftBoundsInViewport = function() {
      return this._recalculateViewportBounds();
    };

    Mob.prototype._recalculateViewportBounds = function() {
      var bom, vb, x1, y1;
      bom = this.bounds.onMap;
      vb = this.main.viewport.bounds;
      x1 = bom.x1 - vb.x1;
      y1 = bom.y1 - vb.y1;
      return this.bounds.inViewport.anchor(x1, y1);
    };

    Mob.prototype.initFence = function() {
      return this.bounds.fenceOnMap = new Bounds(this.main.map.width.pixels, this.main.map.height.pixels);
    };

    Mob.prototype.destroy = function() {};

    Mob.prototype.addEvents = function() {
      var self;
      self = this;
      this.image.onload = function() {
        return self.isLoaded = true;
      };
      return this.image.onerror = function() {
        throw "Image " + self.imagePath + " failed to load!";
      };
    };

    Mob.prototype.removeEvents = function() {};

    Mob.prototype.onAdded = function() {};

    Mob.prototype.setState = function(name) {
      this.state = this.constructor.states[name];
      if (!this.state) throw new Error("Unknown state '" + name + "'!");
      this.currentFrame = 0;
      return this.numFramesDrawn = 0;
    };

    Mob.prototype.tick = function() {
      this.predraw();
      this.draw();
      return this.postdraw();
    };

    Mob.prototype.predraw = function() {
      var ctx, lbiv, _name;
      ctx = this.viewport.canvas.ctx;
      lbiv = this.lastBounds.inViewport;
      ctx.clearRect(lbiv.x1, lbiv.y1, this.width, this.height);
      if (typeof this[_name = this.state.moveHandler] === "function") {
        this[_name]();
      }
      return this._recalculateViewportBounds();
    };

    Mob.prototype.draw = function() {
      var biv, ctx, frame, yOffset;
      ctx = this.viewport.canvas.ctx;
      biv = this.bounds.inViewport;
      ctx.save();
      frame = this.state.frames[this.currentFrame];
      if (frame == null) {
        debugger;
        throw 'frame is undefined';
      }
      yOffset = frame * this.height;
      ctx.drawImage(this.image, 0, yOffset, this.width, this.height, biv.x1, biv.y1, this.width, this.height);
      return ctx.restore();
    };

    Mob.prototype.postdraw = function() {
      if ((this.numFramesDrawn % this.state.frameDuration) === 0) {
        this.currentFrame++;
      }
      if (this.currentFrame === this.state.numFrames) {
        if (this.state.doesRepeat) {
          this.currentFrame = 0;
        } else {
          if (this.state.afterFinish) {
            this.setState(this.state.afterFinish);
          } else {
            throw new Error("No after finish state set for '" + this.state.name + "'!");
          }
        }
      }
      this.lastBounds.inViewport = this.bounds.inViewport.clone();
      return this.numFramesDrawn++;
    };

    Mob.prototype.translate = function() {
      var args, _ref, _ref2;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref = this.bounds.inViewport).translate.apply(_ref, args);
      return (_ref2 = this.bounds.onMap).translate.apply(_ref2, args);
    };

    Mob.prototype.translateBySide = function(side, value) {
      var axis, distMoved;
      axis = side[0];
      distMoved = this.bounds.onMap.translateBySide(side, value);
      this.bounds.inViewport.translate(axis, distMoved);
      return distMoved;
    };

    Mob.prototype.inspect = function() {
      return JSON.stringify({
        "bounds.inViewport": this.bounds.inViewport.inspect(),
        "bounds.onMap": this.bounds.onMap.inspect()
      });
    };

    Mob.prototype.debug = function() {
      console.log("player.bounds.inViewport = " + (this.bounds.inViewport.inspect()));
      return console.log("player.bounds.OnMap = " + (this.bounds.onMap.inspect()));
    };

    return Mob;

  })();

}).call(this);
