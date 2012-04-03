(function() {

  define('mouse_test', function() {
    return {
      init: function() {
        return $('#one').bind('mousedown', function() {
          return console.log('mousedown');
        }).bind('mouseup', function() {
          return console.log('mouseup');
        });
      }
    };
  });

}).call(this);
