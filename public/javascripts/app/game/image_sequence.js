(function() {
  var ImageSequence, assignable, game, meta, simpleDrawable, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;

  ImageSequence = meta.def('game.ImageSequence', assignable, simpleDrawable, {
    init: function(image, width, height, frameIndices, opts) {
      this.image = image;
      this.width = width;
      this.height = height;
      this.frameIndices = frameIndices;
      if (opts == null) opts = {};
      this.numFrames = this.frameIndices.length;
      this.frameDelay = opts.frameDelay || 0;
      this.frameDuration = opts.frameDuration || 1;
      this.doesRepeat = opts.doesRepeat;
      return this.reset();
    },
    reset: function() {
      this.numDraws = 0;
      this.currentFrame = 0;
      return this.lastDrawAt = null;
    },
    draw: function(ctx, x, y) {
      var yOffset;
      if (this.frameDelay > 0) {
        this.frameDelay--;
        return;
      }
      yOffset = this.getCurrentFrame() * this.height;
      ctx.drawImage(this.image.element, 0, yOffset, this.width, this.height, x, y, this.width, this.height);
      this.lastDrawAt = [x, y];
      if ((this.numDraws % this.frameDuration) === 0) this.currentFrame++;
      if (this.currentFrame === this.numFrames) {
        if (this.doesRepeat) {
          this.currentFrame = 0;
        } else {
          if (typeof this.onEndCallback === "function") this.onEndCallback();
        }
      }
      this.numDraws++;
    },
    clear: function(ctx, x, y) {
      if (!this.lastDrawAt) return;
      return ctx.clearRect(this.lastDrawAt[0], this.lastDrawAt[1], this.width, this.height);
    },
    getCurrentFrame: function() {
      var frame;
      frame = this.frameIndices[this.currentFrame];
      if (frame == null) throw new Error('frame is undefined');
      return frame;
    },
    getYOffset: function() {
      return this.getCurrentFrame() * this.height;
    },
    onEnd: function(callback) {
      return this.onEndCallback = callback;
    }
  });

  game.ImageSequence = ImageSequence;

  window.scriptLoaded('app/image_sequence');

}).call(this);
