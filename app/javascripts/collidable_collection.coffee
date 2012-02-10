game = (window.game ||= {})

meta = game.meta2

CollidableCollection = meta.def 'game.CollidableCollection',
  # Initialize the collection.
  #
  # collidables - An optional Array of Grobs to populate the collection with
  #               (default: []).
  # exception   - An optional Grob which will be left out when the collection is
  #               iterated over (default: nothing).
  #
  init: (args...) ->
    if args.length
      [@collidables, @exception] = args
    else
      @collidables = []

  getBlocks: ->
    c for c in @collidables when game.Block.isPrototypeOf(c) and not game.Grob.isPrototypeOf(c)

  each: (fn) ->
    if @exception
      for collidable in @collidables
        if collidable isnt @exception
          ret = fn(collidable)
          break if ret is false
    else
      for collidable in @collidables
        ret = fn(collidable)
        break if ret is false

  get: (index) ->
    @collidables[index]

  push: (collidable) ->
    @collidables.push(collidable)

  delete: (collidable) ->
    @collidables.delete(collidable)

  without: (collidable) ->
    @create(@collidables, collidable)

  # Public: Return whether the given bounds intersects with a collidable object.
  #
  # The collision should be detected correctly whether the given bounds are
  # taller or shorter than the collidable in question.
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
  # of a bounds box to prevent it from colliding with a collidable object when
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

game.CollidableCollection = CollidableCollection

window.scriptLoaded('app/collidable_collection')
