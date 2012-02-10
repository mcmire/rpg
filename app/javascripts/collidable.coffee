game = (window.game ||= {})

meta = game.meta2

# This assumes Mappable
Collidable = meta.def 'game.Collidable',
  assignToMap: (map) ->
    @_super(map)
    @_initCollidables()
    return this

  _initCollidables: ->
    if @map.enableCollisions
      @mapCollidables = @map.getObjectsWithout(this)
    else
      # null/empty object pattern - still works but does nothing
      @mapCollidables = game.CollidableCollection.create()

  intersectsWith: (other) ->
    @bounds.onMap.intersectsWith(other)

  getOuterLeftEdgeBlocking: (other) ->
    @bounds.onMap.getOuterLeftEdgeBlocking(other)

  getOuterRightEdgeBlocking: (other) ->
    @bounds.onMap.getOuterRightEdgeBlocking(other)

  getOuterTopEdgeBlocking: (other) ->
    @bounds.onMap.getOuterTopEdgeBlocking(other)

  getOuterBottomEdgeBlocking: (other) ->
    @bounds.onMap.getOuterBottomEdgeBlocking(other)

game.Collidable = Collidable

window.scriptLoaded('app/collidable')
