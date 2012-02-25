(function() {
  var game;

  (game = this.game).define('mapCollection', function(name) {
    return {
      get: function(name) {
        return maps[name];
      },
      add: function(name, width, height, fn) {
        return maps[name] = game.Map.create(name, width, height, fn);
      }
    };
  });

}).call(this);
