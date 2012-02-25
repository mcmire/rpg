game = (window.game ||= {})

meta = game.meta2

# This assumes assignable
Mappable = meta.def 'game.Mappable',
  init: (@width, @height) ->
    @_initMappableBounds()
    @_initPrevMappableBounds()
    return this

  assignToMap: (map) ->
    @assignTo(map)
    @map = map
    # I don't like this, but it's useful for the player
    @viewport = @map.viewport
    return this

  doToMapBounds: (methodName, args...) ->
    @mbounds[methodName](args...)

  setMapPosition: (x, y) ->
    @doToMapBounds('anchor', x, y)
    # Don't worry about setting the viewport bounds, that happens when the
    # object is drawn

  recalculateViewportBounds: ->
    # XXX: Move this to the viewport?
    x1 = @mbounds.x1 - @viewport.bounds.x1
    y1 = @mbounds.y1 - @viewport.bounds.y1
    @vbounds.anchor(x1, y1)

  inspect: ->
    JSON.stringify
      "vbounds": @vbounds.inspect(),
      "mbounds": @mbounds.inspect()

  debug: ->
    console.log "vbounds = #{@vbounds.inspect()}"
    console.log "mbounds = #{@mbounds.inspect()}"

  _initMappableBounds: ->
    @_initBoundsOnMap()
    @_initBoundsInViewport()

  _initPrevMappableBounds: ->
    @prev = {}
    @prev.mbounds = @mbounds
    @prev.vbounds = @vbounds

  _initBoundsOnMap: ->
    @mbounds = game.Bounds.rect(0, 0, @width, @height)

  _initBoundsInViewport: ->
    @vbounds = game.Bounds.rect(0, 0, @width, @height)

game.Mappable = Mappable
