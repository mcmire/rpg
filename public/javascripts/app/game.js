(function() {

  define('game', function() {
    return {
      init: function() {
        return require('game.main').init();
      }
    };
  });

}).call(this);
