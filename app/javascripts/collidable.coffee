game = (window.game ||= {})

meta = game.meta
Mappable = game.Mappable
CollidableCollection = game.CollidableCollection

_boundsFrom = (boundsOrGrob) ->
  if boundsOrGrob.bounds?
    boundsOrGrob.bounds.onMap
  else
    boundsOrGrob

Collidable = meta.def 'game.Collidable',
  Mappable,

  # TODO: Can we assume that this is core??
  init: (@core) ->
    @_super()
    {@collisionLayer} = @core
    @_initCollisionLayer()

  _initCollisionLayer: ->
    @_super()
    if @collisionLayer
      @allCollidables = @collisionLayer.collidables.without(this)
    else
      # null/empty object pattern - still works but does nothing
      @allCollidables = new CollidableCollection()

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

window.numScriptsLoaded++
