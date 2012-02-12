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

  setMapPosition: (x, y) ->
    @_super(x, y)
    @cbounds.anchor(x, y)

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
    if @map.enableCollisions
      @mapCollidables = @map.getObjectsWithout(this)
    else
      # null/empty object pattern - still works but does nothing
      @mapCollidables = game.CollidableCollection.create()

game.Collidable = Collidable

window.scriptLoaded('app/collidable')
