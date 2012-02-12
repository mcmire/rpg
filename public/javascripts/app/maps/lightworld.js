(function() {

  define(function(require) {
    var Background, Foreground, MapGroup, map, _ref;
    _ref = require('app/maps'), MapGroup = _ref.MapGroup, Foreground = _ref.Foreground, Background = _ref.Background;
    require('./lw_52')(areas);
    return map = {
      areas: areas,
      assignTo: function(core) {
        this.core = core;
        return this.viewport = this.core.viewport;
      },
      destroy: function() {
        return this.currentArea.destroy();
      },
      load: function() {
        return this.loadArea('lw_52');
      },
      addPlayer: function(player) {
        return this.currentArea.addPlayer(player);
      },
      tick: function() {
        return this.currentArea.tick();
      },
      loadArea: function(nameOrMap) {
        if (nameOrMap.isPrototypeOf(Map)) {
          this.currentArea = nameOrMap;
        } else {
          this.currentArea = this.areas.getMap(name);
        }
        this.currentArea.load();
        return this.canvas.$element.css("background-image", this.currentArea.url);
      },
      getAreaUp: function() {
        return this.currentArea.up;
      },
      loadAreaUp: function() {},
      getAreaDown: function() {
        return this.currentArea.down;
      },
      loadAreaDown: function() {},
      getAreaLeft: function() {
        return this.currentArea.left;
      },
      loadAreaLeft: function() {},
      getAreaRight: function() {
        return this.currentArea.right;
      },
      loadAreaRight: function() {}
    };
  });

}).call(this);
