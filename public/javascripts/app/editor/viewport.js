(function() {

  define('editor.viewport', function() {
    var meta;
    meta = require('meta');
    return meta.def({
      init: function(core) {
        this.core = core;
        this.$map = $('#editor-map');
        this.width = this.$map.width();
        this.height = this.$map.height();
        this.bounds = require('game.Bounds').rect(0, 0, this.width, this.height);
        return this;
      },
      setHeight: function(height) {
        this.$map.height(height);
        return this.height = height;
      },
      setMap: function(map) {
        this.currentMap = map;
        map.setParent(this);
        return map.attach();
      },
      unsetMap: function() {
        return this.currentMap.detach();
      }
    });
  });

}).call(this);
