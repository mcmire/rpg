(function() {

  define('game.mapCollection', function() {
    var add, get, maps;
    maps = {};
    get = function(name) {
      var imageCollection, img, spr, spriteCollection;
      imageCollection = require('game.imageCollection');
      spriteCollection = require('game.spriteCollection');
      spr = spriteCollection.get;
      img = imageCollection.get;
      return maps[name] = require("game/maps/" + name)(add, img, spr);
    };
    add = function(name, width, height, fn) {
      var map;
      map = require('game.Map').create(name, width, height, fn);
      maps[name] = map;
      return map;
    };
    return {
      get: get,
      add: add
    };
  });

}).call(this);
