var __slice = Array.prototype.slice;

define(function(require) {
  var Bounds, CollidableCollection, Grob, Mob;
  Grob = require('app/grob');
  Bounds = require('app/bounds');
  CollidableCollection = require('app/collidable_collection');
  Mob = Grob.extend('game.Mob', {
    statics: {
      __inherited__: function(subclass) {
        return subclass.states = {};
      },
      addState: function(name, args) {
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
      }
    },
    members: {
      init: function(core) {
        this.map = core.map, this.collisionLayer = core.collisionLayer;
        this._super(core);
        this.speed = this.constructor.speed;
        return this.imagePath = "" + this.core.imagesPath + "/" + this.constructor.image;
      },
      _initDims: function() {
        this.width = this.constructor.width;
        return this.height = this.constructor.height;
      },
      _initBoundsOnMap: function() {
        this._initFence();
        return this._super();
      },
      _initFence: function() {
        return this.fence = Bounds.rect(0, 0, this.map.width, this.map.height);
      },
      _initCollisionLayer: function() {
        this._super();
        if (this.collisionLayer) {
          return this.allCollidables = this.collisionLayer.collidables.without(this);
        } else {
          return this.allCollidables = new CollidableCollection();
        }
      },
      load: function() {
        var self;
        self = this;
        this.image = new Image();
        this.image.src = this.imagePath;
        this.image.onload = function() {
          return self.isLoaded = true;
        };
        return this.image.onerror = function() {
          throw "Image " + self.imagePath + " failed to load!";
        };
      },
      setState: function(name) {
        this.state = this.constructor.states[name];
        if (!this.state) throw new Error("Unknown state '" + name + "'!");
        this.currentFrame = 0;
        return this.numSeqFrameDraws = 0;
      },
      predraw: function() {
        var _name;
        this._super();
        if (typeof this[_name = this.state.moveHandler] === "function") {
          this[_name]();
        }
        return this._recalculateViewportBounds();
      },
      draw: function() {
        var biv, ctx, frame, yOffset;
        biv = this.bounds.inViewport;
        ctx = this.viewport.canvas.ctx;
        frame = this.state.frames[this.currentFrame];
        if (frame == null) {
          debugger;
          throw 'frame is undefined';
        }
        yOffset = frame * this.height;
        return ctx.drawImage(this.image, 0, yOffset, this.width, this.height, biv.x1, biv.y1, this.width, this.height);
      },
      postdraw: function() {
        if ((this.numSeqFrameDraws % this.state.frameDuration) === 0) {
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
        this.numSeqFrameDraws++;
        return this._super();
      },
      translate: function() {
        var args, _ref, _ref2;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        (_ref = this.bounds.inViewport).translate.apply(_ref, args);
        return (_ref2 = this.bounds.onMap).translate.apply(_ref2, args);
      },
      translateBySide: function(side, value) {
        var axis, distMoved;
        axis = side[0];
        distMoved = this.bounds.onMap.translateBySide(side, value);
        this.bounds.inViewport.translate(axis, distMoved);
        return distMoved;
      }
    }
  });
  return Mob;
});
