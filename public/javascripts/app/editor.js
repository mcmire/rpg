(function() {

  define('editor', function() {
    return {
      init: function() {
        require('editor.dnd');
        return require('editor.core').init();
      }
    };
  });

}).call(this);
