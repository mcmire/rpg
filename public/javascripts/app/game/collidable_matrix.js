(function() {

  define('game.CollidableMatrix', function() {
    var CollidableMatrix, SortedObjectMatrix, meta;
    meta = require('meta');
    SortedObjectMatrix = require('game.SortedObjectMatrix');
    CollidableMatrix = SortedObjectMatrix.clone().extend({
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
    return CollidableMatrix;
  });

}).call(this);
