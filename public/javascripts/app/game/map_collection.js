(function() {
  var game, maps;

  game = (window.game || (window.game = {}));

  maps = {};

  game.mapCollection = {
    get: function(name) {
      return maps[name];
    },
    add: function(name, width, height, fn) {
      return maps[name] = game.Map.create(name, width, height, fn);
    }
  };

}).call(this);
