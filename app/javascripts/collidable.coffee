define (require) ->
  meta = require('app/meta2')
  Mappable = require('app/mappable')
  CollidableCollection = require('app/collidable_collection')

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

  return Collidable
