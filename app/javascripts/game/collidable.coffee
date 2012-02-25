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

  doToMapBounds: (args...) ->
    # Ensure that the player is in the right place in the sorted list of map
    # objects. If the player is now behind another object, then we want it to be
    # drawn behind that object instead of being clobbered.
    @map.objects.remove(this)
    @_super(args...)
    @map.objects.add(this)

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

  _initCollidableBounds: ->
    @cbounds = game.Bounds.rect(0, 0, @width, @height-8)

  _initCollidables: ->
    @mapCollidables = @map.getObjectsWithout(this)

game.Collidable = Collidable

window.scriptLoaded('app/collidable')
