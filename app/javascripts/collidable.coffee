game = (window.game ||= {})

meta = game.meta2

# This assumes Mappable
Collidable = meta.def 'game.Collidable',
  init: (args...) ->
    @_super(args...)
    @_initCollidableBounds()

  assignToMap: (map) ->
    @_super(map)
    @_initCollidables()
    return this

  callOnMapBounds: (args...) ->
    @_super(args...)
    # @_replaceInMapCollidables()

  setMapPosition: (x, y) ->
    @_super(x, y)
    @cbounds.anchor(x, y)

  translate: (args...) ->
    @_super(args...)
    @cbounds.translate(args...)

  translateBySide: (args...) ->
    @_super(args...)
    @cbounds.translateBySide(args...)

  intersectsWith: (other) ->
    @cbounds.intersectsWith(other)

  getOuterLeftEdgeBlocking: (other) ->
    @cbounds.getOuterLeftEdgeBlocking(other)

  getOuterRightEdgeBlocking: (other) ->
    @cbounds.getOuterRightEdgeBlocking(other)

  getOuterTopEdgeBlocking: (other) ->
    @cbounds.getOuterTopEdgeBlocking(other)

  getOuterBottomEdgeBlocking: (other) ->
    @cbounds.getOuterBottomEdgeBlocking(other)

  _replaceInMapCollidables: ->
    # Ensure that the player is in the right place in the sorted list of map
    # objects (this really only matters if the player is moving vertically).
    # If the player is now behind another object, then we want it to be drawn
    # behind that object instead of being clobbered.
    @mapCollidables.remove(this)
    @mapCollidables.add(this)

  _initCollidableBounds: ->
    @cbounds = game.Bounds.rect(0, 0, @width, @height-8)

  _initCollidables: ->
    if @map.enableCollisions
      @mapCollidables = @map.getObjectsWithout(this)
    else
      # null/empty object pattern - still works but does nothing
      @mapCollidables = game.CollidableCollection.getEmpty()

game.Collidable = Collidable

window.scriptLoaded('app/collidable')
