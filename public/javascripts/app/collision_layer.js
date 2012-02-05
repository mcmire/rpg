(function() {
  var CollidableCollection, MapBlock, collisionLayer, game, loadable, module, tickable, _ref;

  game = (window.game || (window.game = {}));

  module = game.meta.module;

  _ref = game.roles, loadable = _ref.loadable, tickable = _ref.tickable;

  CollidableCollection = game.CollidableCollection;

  MapBlock = game.MapBlock;

  collisionLayer = module('game.collisionLayer', loadable, tickable, {
    init: function(core) {
      this.core = core;
      this.viewport = this.core.viewport;
      this.width = this.viewport.width;
      this.height = this.viewport.height;
      this.collidables = new CollidableCollection();
      return this.add(new MapBlock(this.core, 96, 96, 256, 16));
    },
    add: function(collidable) {
      return this.collidables.push(collidable);
    },
    load: function() {
      return this.isLoaded = true;
    },
    tick: function() {
      var collidable, _i, _len, _ref2, _results;
      _ref2 = this.collidables.getMapBlocks();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        collidable = _ref2[_i];
        _results.push(collidable.tick());
      }
      return _results;
    }
  });

  game.collisionLayer = collisionLayer;

  window.numScriptsLoaded++;

}).call(this);
