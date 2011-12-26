game = window.game
{Bounds} = game

game.Mob = class Mob
  constructor: (@main, spritePath, spriteWidth, spriteHeight) ->
    @viewport = @main.viewport
    @_initSpriteSheet(spritePath, spriteWidth, spriteHeight)
    @_initBounds()
    @isLoaded = false

  destroy: ->
    # does nothing by default

  addEvents: ->
    # does nothing by default

  removeEvents: ->
    # does nothing by default

  onAdded: ->
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
  #   shiftBounds(x: 20)
  #   shiftBounds(x: 2, y: -9)
  #
  shiftBounds: (vec) ->
    @bounds.inViewport.shift(vec)
    @bounds.onMap.shift(vec)

  # Shifts the viewport and map bounds by a vector such that the given key
  # (e.g., "x1", "y2) ends up being the value for the corresponding key
  # in the viewport bound. The map bounds will be re-calculated appropriately.
  #
  # Examples:
  #
  #   moveMapBoundsTo("x2", 2000)
  #   moveMapBoundsTo("y1", 0)
  #
  # Also see:
  #
  #   Bounds#moveTo
  #
  moveMapBoundsTo: (key, val) ->
    [axis, side] = key
    distMoved = @bounds.onMap.moveTo(key, val)
    @bounds.inViewport.shift(axis, distMoved)

  inspect: ->
    JSON.stringify(
      "bounds.inViewport": @bounds.inViewport.inspect(),
      "bounds.onMap": @bounds.onMap.inspect()
    )

  debug: ->
    console.log "player.bounds.inViewport = #{@bounds.inViewport.inspect()}"
    console.log "player.bounds.OnMap = #{@bounds.onMap.inspect()}"

  _initBounds: ->
    @bounds = {}
    @lastBounds = {}
    @_initBoundsInViewport()
    @_initBoundsOnMap()

  _initBoundsInViewport: ->
    x1 = 0
    x2 = x1 + @spriteSheet.width
    y1 = 0
    y2 = y1 + @spriteSheet.height
    @bounds.inViewport = @lastBounds.inViewport = new Bounds(x1, x2, y1, y2)

  _initBoundsOnMap: ->
    x1 = @viewport.frame.boundsOnMap.x1 + @bounds.inViewport.x1
    x2 = x1 + @spriteSheet.width
    y1 = @viewport.frame.boundsOnMap.y1 + @bounds.inViewport.y1
    y2 = y1 + @spriteSheet.height
    @bounds.onMap = new Bounds(x1, x2, y1, y2)
