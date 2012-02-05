game = (window.game ||= {})

Class = game.Class
MapBlock = game.MapBlock
Grob = game.Grob

_boundsFrom = (boundsOrGrob) ->
  if boundsOrGrob instanceof Grob
    boundsOrGrob.bounds.onMap
  else
    boundsOrGrob

# TODO: Make this a singleton?
CollidableCollection = Class.extend 'game.CollidableCollection',
  init: (args...) ->
    if args.length
      [@collidables, @exception] = args
    else
      @collidables = []

  getMapBlocks: ->
    c for c in @collidables when c instanceof MapBlock

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

  without: (collidable) ->
    new @constructor(@collidables, collidable)

  # Public: Return whether the given bounds intersects with a collidable object.
  #
  # The collision should be detected correctly whether the given bounds are
  # taller or shorter than the collidable in question.
  #
  # boundsOrGrob - An instance of Bounds or Grob.
  #
  # Returns true or false.
  #
  intersectsWith: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    ret = false
    @each (collidable) ->
      if collidable.intersectsWith(bounds)
        ret = true
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the x1 coordinate
  # of a bounds box to prevent it from colliding with a collidable object when
  # moving rightward.
  #
  # boundsOrGrob - An instance of Bounds or Grob.
  #
  # Returns the integer X-coordinate of the left side of the collidable that
  # the given bounds collides with if one exists, or null otherwise.
  #
  getOuterLeftEdgeBlocking: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    ret = null
    @each (collidable) ->
      if ret = collidable.getOuterLeftEdgeBlocking(bounds)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the x2 coordinate
  # of a bounds box to prevent it from colliding with a collidable object when
  # moving leftward.
  #
  # boundsOrGrob - An instance of Bounds or Grob.
  #
  # Returns the integer X-coordinate of the right side of the collidable that
  # the given bounds collides with if one exists, or null otherwise.
  #
  getOuterRightEdgeBlocking: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    ret = null
    @each (collidable) ->
      if ret = collidable.getOuterRightEdgeBlocking(bounds)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the y2 coordinate
  # of a bounds box to prevent it from colliding with a collidable object when
  # moving downward.
  #
  # boundsOrGrob - An instance of Bounds or Grob.
  #
  # Returns the integer Y-coordinate of the top side of the collidable that
  # the given bounds collides with if one exists, or null otherwise.
  #
  getOuterTopEdgeBlocking: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    ret = null
    @each (collidable) ->
      if ret = collidable.getOuterTopEdgeBlocking(bounds)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the y1 coordinate
  # of a bounds box to prevent it from colliding with a collidable object when
  # moving upward.
  #
  # boundsOrGrob - An instance of Bounds or Grob.
  #
  # Returns the integer Y-coordinate of the bottom side of the collidable that
  # the given bounds collides with if one exists, or null otherwise.
  #
  getOuterBottomEdgeBlocking: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    ret = null
    @each (collidable) ->
      if ret = collidable.getOuterBottomEdgeBlocking(bounds)
        return false
    return ret

game.CollidableCollection = CollidableCollection

window.numScriptsLoaded++
