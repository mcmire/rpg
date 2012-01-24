define (require) ->
  {Class, module} = require('app/meta')
  {loadable, tickable, drawable} = require('app/roles')
  Bounds = require('app/bounds')

  _boundsFrom = (boundsOrGrob) ->
    if boundsOrGrob instanceof Grob
      boundsOrGrob.bounds.onMap
    else
      boundsOrGrob

  Grob = Class.extend 'game.Grob',
    loadable,
    tickable,
    drawable,

    init: (@core) ->
      {@viewport, @collisionLayer} = @core
      @_initDims()
      @reset()

    reset: ->
      @_initBounds()
      @_initLastBounds()
      @_initCollisionLayer()

    _initDims: ->
      throw new Error 'must be overridden'

    _initBounds: ->
      @bounds = {}
      @_initBoundsOnMap()
      @_initBoundsInViewport()

    _initLastBounds: ->
      @lastBounds = {}
      @lastBounds.onMap = @bounds.onMap
      @lastBounds.inViewport = @bounds.inViewport

    _initBoundsOnMap: ->
      @bounds.onMap = Bounds.rect(0, 0, @width, @height)

    _initBoundsInViewport: ->
      @bounds.inViewport = Bounds.rect(0, 0, @width, @height)
      @_recalculateViewportBounds()

    _recalculateViewportBounds: ->
      x1 = @bounds.onMap.x1 - @viewport.bounds.x1
      y1 = @bounds.onMap.y1 - @viewport.bounds.y1
      @bounds.inViewport.anchor(x1, y1)

    _initCollisionLayer: ->
      # ... ?

    load: ->
      @isLoaded = true

    tick: ->
      @predraw()
      @draw()
      @postdraw()

    predraw: ->
      lbiv = @lastBounds.inViewport
      ctx = @viewport.canvas.ctx
      ctx.clearRect(lbiv.x1, lbiv.y1, @width, @height)

    draw: ->
      # this will presumably be overridden
      biv = @bounds.inViewport
      ctx = @viewport.canvas.ctx
      ctx.save()
      ctx.strokeStyle = '#ff0000'
      ctx.strokeRect(biv.x1, biv.y1, @width, @height)
      ctx.restore()

    postdraw: ->
      @lastBounds.inViewport = @bounds.inViewport.clone()

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

    inspect: ->
      JSON.stringify
        "bounds.inViewport": @bounds.inViewport.inspect(),
        "bounds.onMap": @bounds.onMap.inspect()

    debug: ->
      console.log "bounds.inViewport = #{@bounds.inViewport.inspect()}"
      console.log "bounds.OnMap = #{@bounds.onMap.inspect()}"

  return Grob
