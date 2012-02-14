(function() {
  var CollidableCollection, SortedObjectCollection, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  SortedObjectCollection = game.SortedObjectCollection;

  CollidableCollection = SortedObjectCollection.cloneAs('game.CollidableCollection').extend({
    intersectsWith: function(other) {
      var ret;
      ret = false;
      this.each(function(collidable) {
        if (collidable.intersectsWith(other)) {
          ret = true;
          return false;
        }
      });
      return ret;
    },
    getOuterLeftEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterLeftEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterRightEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterRightEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterTopEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterTopEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterBottomEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterBottomEdgeBlocking(other)) return false;
      });
      return ret;
    }
  });

  game.CollidableCollection = CollidableCollection;

  window.scriptLoaded('app/collidable_collection');

}).call(this);
