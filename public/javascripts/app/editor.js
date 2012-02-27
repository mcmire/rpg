(function() {

  define('editor', function() {
    return {
      init: function() {
        return require('editor.core').init();
      }
    };
  });

}).call(this);
