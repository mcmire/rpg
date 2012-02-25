game = (window.game ||= {})

meta = game.meta2
SortedObjectMatrix = game.SortedObjectMatrix

CollidableMatrix = SortedObjectMatrix.cloneAs('game.CollidableMatrix').extend
  # Public: Determine whether the given bounds intersect with an object in
  # @objects.
  #
  # other - An instance of Bounds, or an object that includes Mappable.
  #
  # Returns true or false.
  #
  intersectsWith: (other) ->
    ret = false
    @each (collidable) ->
      if collidable.intersectsWith(other)
        ret = true
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the x1 coordinate
  # of a bounds box to prevent it from colliding with an object in @objects when
  # moving rightward.
  #
  # other - An instance of Bounds, or an object that includes Mappable.
  #
  # Returns the integer X-coordinate of the left side of the collidable that
  # the given bounds collides with if one exists, or null otherwise.
  #
  getOuterLeftEdgeBlocking: (other) ->
    ret = null
    @each (collidable) ->
      if ret = collidable.getOuterLeftEdgeBlocking(other)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the x2 coordinate
  # of a bounds box to prevent it from colliding with a collidable object when
  # moving leftward.
  #
  # other - An instance of Bounds, or an object that includes Mappable.
  #
  # Returns the integer X-coordinate of the right side of the collidable that
  # the given bounds collides with if one exists, or null otherwise.
  #
  getOuterRightEdgeBlocking: (other) ->
    ret = null
    @each (collidable) ->
      if ret = collidable.getOuterRightEdgeBlocking(other)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the y2 coordinate
  # of a bounds box to prevent it from colliding with a collidable object when
  # moving downward.
  #
  # other - An instance of Bounds, or an object that includes Mappable.
  #
  # Returns the integer Y-coordinate of the top side of the collidable that
  # the given bounds collides with if one exists, or null otherwise.
  #
  getOuterTopEdgeBlocking: (other) ->
    ret = null
    @each (collidable) ->
      if ret = collidable.getOuterTopEdgeBlocking(other)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the y1 coordinate
  # of a bounds box to prevent it from colliding with a collidable object when
  # moving upward.
  #
  # other - An instance of Bounds, or an object that includes Mappable.
  #
  # Returns the integer Y-coordinate of the bottom side of the collidable that
  # the given bounds collides with if one exists, or null otherwise.
  #
  getOuterBottomEdgeBlocking: (other) ->
    ret = null
    @each (collidable) ->
      if ret = collidable.getOuterBottomEdgeBlocking(other)
        return false
    return ret

game.CollidableMatrix = CollidableMatrix
