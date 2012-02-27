(function() {

  define('game.mapCollection', function() {
    var maps;
    maps = {};
    return {
      get: function(name) {
        return maps[name];
      },
      add: function(name, width, height, fn) {
        var map;
        map = require('game.Map').create(name, width, height, fn);
        maps[name] = map;
        return map;
      }
    };
  });

}).call(this);
