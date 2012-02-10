game = (window.game ||= {})

meta = game.meta2

_boundsFrom = (mappableOrBounds) ->
  if mappableOrBounds.doesInclude('game.Mappable')
    mappableOrBounds.bounds.onMap
  else
    mappableOrBounds

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

  intersectsWith: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    @bounds.onMap.intersectsWith(bounds)

  getOuterLeftEdgeBlocking: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    @bounds.onMap.getOuterLeftEdgeBlocking(bounds)

  getOuterRightEdgeBlocking: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    @bounds.onMap.getOuterRightEdgeBlocking(bounds)

  getOuterTopEdgeBlocking: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    @bounds.onMap.getOuterTopEdgeBlocking(bounds)

  getOuterBottomEdgeBlocking: (boundsOrGrob) ->
    bounds = _boundsFrom(boundsOrGrob)
    @bounds.onMap.getOuterBottomEdgeBlocking(bounds)

game.Collidable = Collidable

window.scriptLoaded('app/collidable')
