define (require) ->
  {Class, module} = require('app/meta')
  {loadable, tickable, drawable} = require('app/roles')
  Bounds = require('app/bounds')
  {CollidableBox} = require('app/collision_layer')

  Grob = Class.extend 'game.Grob', loadable, tickable, drawable,
    init: (@main) ->
      {@viewport, @map, @collisionLayer} = @main

      @isLoaded = false
      @ctx = @viewport.canvas.ctx

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
      # TODO: Do we still need this anymore?
      @box = new CollidableBox(@bounds.onMap)

    load: ->
      @isLoaded = true

    tick: ->
      @predraw()
      @draw()
      @postdraw()

    predraw: ->
      lbiv = @lastBounds.inViewport
      @ctx.clearRect(lbiv.x1, lbiv.y1, @width, @height)

    draw: ->
      # this will presumably be overridden
      biv = @bounds.inViewport
      @ctx.save()
      @ctx.strokeStyle = '#ff0000'
      @ctx.strokeRect(biv.x1, biv.y1, @width, @height)
      @ctx.restore()

    postdraw: ->
      @lastBounds.inViewport = @bounds.inViewport.clone()

    inspect: ->
      JSON.stringify
        "bounds.inViewport": @bounds.inViewport.inspect(),
        "bounds.onMap": @bounds.onMap.inspect()

    debug: ->
      console.log "bounds.inViewport = #{@bounds.inViewport.inspect()}"
      console.log "bounds.OnMap = #{@bounds.onMap.inspect()}"

  return Grob
