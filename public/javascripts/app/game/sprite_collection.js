(function() {
  var game;

  (game = this.game).define('spriteCollection', function(name) {
    var ImageSequence, add, imageCollection, sprites;
    ImageSequence = this.ImageSequence;
    imageCollection = this.imageCollection;
    sprites = {};
    add = function(imagePath, width, height, frameIndices, opts) {
      if (opts == null) opts = {};
      return sprites[imagePath] = ImageSequence.create(imageCollection.get(imagePath), width, height, frameIndices, opts);
    };
    add('flower', 16, 16, [2, 0, 1], {
      frameDuration: 6,
      doesRepeat: true
    });
    return {
      get: function(name) {
        return sprites[name];
      }
    };
  });

}).call(this);
