game = window.game
{Bounds} = game

game.util.module "game.Viewport",
  playerPadding: 30  # pixels

  init: (@main) ->
    unless @isInit
      @reset()
      @width = @main.viewportWidth
      @height = @main.viewportHeight
      @isInit = true
    return this

  destroy: ->
    if @isInit
      @reset()
      @isInit = false
    return this

  reset: ->
    # (width: null)
    # (height: null)
    @frame = {
      boundsOnMap: new Bounds()
    }
    @padding = {
      boundsInFrame: new Bounds()
    }
    return this

  initBounds: ->
    @frame.boundsOnMap = new Bounds(0, @width.pixels, 0, @height.pixels)
    @padding.boundsInFrame = new Bounds(
      @frame.boundsOnMap.x1 + @playerPadding
      @frame.boundsOnMap.x2 - @playerPadding
      @frame.boundsOnMap.y1 + @playerPadding
      @frame.boundsOnMap.y2 - @playerPadding
    )
    return this

  # Shifts the frame and padding bounds by the given vector.
  #
  # Examples:
  #
  #   shiftBounds(x: 20)
  #   shiftBounds(x: 2, y: -9)
  #
  shiftBounds: (vec) ->
    @frame.boundsOnMap.shift(vec)
    # @padding.bounds.shift(vec)

  # Shifts the frame and padding bounds by a vector such that the given key
  # (e.g., "x1", "y2) ends up being the given value for the corresponding
  # key in the frame bounds. The padding bounds will be re-calculated
  # appropriately.
  #
  # Examples:
  #
  #   moveFrameBoundsTo("x2", 2000)
  #   moveFrameBoundsTo("y1", 0)
  #
  # Also see:
  #
  #   Bounds#moveTo
  #
  moveFrameBoundsTo: (key, val) ->
    diff = @frame.boundsOnMap.moveTo(key, val)
    #axis = key[0]
    #@padding.bounds.shift(axis, diff)

  inspect: ->
    JSON.stringify(
      "frame.boundsOnMap": @frame.boundsOnMap.inspect()
      "padding.boundsInFrame": @padding.boundsInFrame.inspect()
    )

  debug: ->
    console.log "viewport.frame.bounds = (#{@frame.bounds.x1}..#{@frame.bounds.x2}, #{@frame.bounds.y1}..#{@frame.bounds.y2})"
    console.log "viewport.padding.bounds = (#{@padding.bounds.x1}..#{@padding.bounds.x2}, #{@padding.bounds.y1}..#{@padding.bounds.y2})"


