{Bounds} = game = window.game

class game.Mob
  constructor: (@main) ->
    {@viewport, @map, @collisionLayer} = @main

    @initSpriteSheet()
    @width = @spriteSheet.width
    @height = @spriteSheet.height

    @_initBounds()

    @isLoaded = false

  _initBounds: ->
    @bounds = {}
    @lastBounds = {}
    @bounds.onMap = @lastBounds.onMap = new Bounds(@width, @height)
    @bounds.inViewport = @lastBounds.inViewport = new Bounds(@width, @height)

    @initFence()
    @initTopLeftBoundsOnMap()
    @initTopLeftBoundsInViewport()

  initTopLeftBoundsOnMap: ->
    @bounds.onMap.anchor(0, 0)

  initTopLeftBoundsInViewport: ->
    @_recalculateViewportBounds()

  _recalculateViewportBounds: ->
    # take the bounds.onMap and map them to viewport bounds
    bom = @bounds.onMap
    vb = @main.viewport.frameBoundsOnMap
    x1 = bom.x1 - vb.x1
    y1 = bom.y1 - vb.y1
    @bounds.inViewport.anchor(x1, y1)

  initFence: ->
    @bounds.fenceOnMap = new Bounds(
      @main.map.width.pixels,
      @main.map.height.pixels
    )

  destroy: ->
    # does nothing by default

  addEvents: ->
    # does nothing by default

  removeEvents: ->
    # does nothing by default

  onAdded: ->
    # does nothing by default

  update: ->
    # does nothing by default

  draw: ->
    canvas = @viewport.canvas
    canvas.ctx.clearRect(
      @lastBounds.inViewport.x1,
      @lastBounds.inViewport.y1,
      @lastBounds.inViewport.x2,
      @lastBounds.inViewport.y2
    )
    @spriteSheet.draw()
    @lastBounds.inViewport = @bounds.inViewport.clone()

  # Shifts the viewport and map bounds by the given vector.
  #
  # Examples:
  #
  #   translateBounds(x: 20)
  #   translateBounds(x: 2, y: -9)
  #
  translateBounds: (vec) ->
    @bounds.inViewport.translate(vec)
    @bounds.onMap.translate(vec)

  # Shifts the viewport and map bounds by a vector such that the given key
  # (e.g., "x1", "y2) ends up being the value for the corresponding key
  # in the viewport bound. The map bounds will be re-calculated appropriately.
  #
  # Examples:
  #
  #   moveBoundsCorner("x2", 2000)
  #   moveBoundsCorner("y1", 0)
  #
  # Also see:
  #
  #   Bounds#moveTo
  #
  moveBoundsCorner: (key, val) ->
    [axis, side] = key
    distMoved = @bounds.onMap.moveCorner(key, val)
    @bounds.inViewport.translate(axis, distMoved)

  inspect: ->
    JSON.stringify(
      "bounds.inViewport": @bounds.inViewport.inspect(),
      "bounds.onMap": @bounds.onMap.inspect()
    )

  debug: ->
    console.log "player.bounds.inViewport = #{@bounds.inViewport.inspect()}"
    console.log "player.bounds.OnMap = #{@bounds.onMap.inspect()}"
