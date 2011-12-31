(function() {
  var AnimationSequence, SpriteSheet, game;

  game = window.game;

  SpriteSheet = (function() {

    function SpriteSheet(mob, path, width, height) {
      this.mob = mob;
      this.width = width;
      this.height = height;
    }

    SpriteSheet.prototype.addSequence = function(name, skipFreq, frames, opts) {
      if (opts == null) opts = {};
      if (opts.repeat == null) opts.repeat = true;
      return this.sequences[name] = new AnimationSequence(this, skipFreq, frames, opts.repeat, opts.then);
    };

    SpriteSheet.prototype.useSequence = function(name) {
      var seq;
      if (name !== this.currentSequence) {
        this.currentSequence = name;
        seq = this.sequences[this.currentSequence];
        if (!seq) throw "" + name + " is not a sequence";
        return seq.reset();
      }
    };

    SpriteSheet.prototype.draw = function() {
      var seq;
      seq = this.sequences[this.currentSequence];
      if (!seq) throw "" + name + " is not a sequence";
      seq.draw();
      if (seq.isFinished() && seq.afterFinish) {
        return this.useSequence(seq.afterFinish);
      }
    };

    return SpriteSheet;

  })();

  AnimationSequence = (function() {

    function AnimationSequence(spriteSheet, skipFreq, frames, repeat, afterFinish) {
      this.spriteSheet = spriteSheet;
      this.skipFreq = skipFreq;
      this.frames = frames;
      this.repeat = repeat;
      this.afterFinish = afterFinish;
      this.numFrames = this.frames.length;
    }

    AnimationSequence.prototype.reset = function() {
      return this.currentFrame = 0;
    };

    AnimationSequence.prototype.draw = function() {
      var ctx, frame, height, image, mob, width, x, y, yOffset, _ref;
      _ref = this.spriteSheet, mob = _ref.mob, image = _ref.image, width = _ref.width, height = _ref.height;
      ctx = mob.viewport.canvas.ctx;
      x = mob.bounds.inViewport.x1;
      y = mob.bounds.inViewport.y1;
      ctx.save();
      frame = this.frames[this.currentFrame];
      if (frame == null) throw 'frame is undefined';
      yOffset = frame * height;
      ctx.drawImage(image, 0, yOffset, width, height, x, y, width, height);
      ctx.restore();
      if ((this.spriteSheet.mob.main.numDraws % this.skipFreq) === 0) {
        this.currentFrame++;
        if (this.repeat) return this.currentFrame %= this.numFrames;
      }
    };

    AnimationSequence.prototype.isFinished = function() {
      return this.currentFrame >= this.numFrames;
    };

    return AnimationSequence;

  })();

  game.SpriteSheet = SpriteSheet;

}).call(this);
