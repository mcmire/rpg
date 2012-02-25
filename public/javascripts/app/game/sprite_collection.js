(function() {
  var ImageSequence, add, game, imageCollection, sprites;

  game = (window.game || (window.game = {}));

  ImageSequence = game.ImageSequence;

  imageCollection = game.imageCollection;

  sprites = {};

  add = function(imagePath, width, height, frameIndices, opts) {
    if (opts == null) opts = {};
    return sprites[imagePath] = ImageSequence.create(imageCollection.get(imagePath), width, height, frameIndices, opts);
  };

  add('flower', 16, 16, [2, 0, 1], {
    frameDuration: 6,
    doesRepeat: true
  });

  game.spriteCollection = {
    get: function(name) {
      return sprites[name];
    }
  };

  window.scriptLoaded('app/sprite_collection');

}).call(this);
