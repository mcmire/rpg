(function() {

  define('game.spriteCollection', function() {
    var ImageSequence, add, each, get, imageCollection, sprites;
    ImageSequence = require('game.ImageSequence');
    imageCollection = require('game.imageCollection');
    sprites = {};
    add = function(name, width, height, frameIndices, opts) {
      if (opts == null) opts = {};
      return sprites[name] = ImageSequence.create(name, imageCollection.get(name), width, height, frameIndices, opts);
    };
    get = function(name) {
      return sprites[name] || (function() {
        throw new Error("Couldn't find sprite " + name + "!");
      })();
    };
    each = function(fn) {
      var names;
      names = $.v.keys(sprites).sort();
      return $.v.each(names, function(name) {
        return fn(sprites[name]);
      });
    };
    add('flower', 16, 16, [2, 0, 1], {
      frameDuration: 6,
      doesRepeat: true
    });
    return {
      get: get,
      each: each
    };
  });

}).call(this);
