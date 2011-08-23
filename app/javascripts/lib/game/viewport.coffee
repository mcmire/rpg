game = window.game
{Bounds} = game

game.util.module "game.Viewport",
  playerPadding: 30  # pixels

  init: (@main) ->
    unless @isInit
      @width = @main.viewportWidth
      @height = @main.viewportHeight
      @reset()
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
      bounds: new Bounds()
    }
    @padding = {
      bounds: new Bounds()
    }
    return this

  initBounds: ->
    @frame.bounds.x1 = 0
    @frame.bounds.x2 = @width.pixels
    @frame.bounds.y1 = 0
    @frame.bounds.y2 = @height.pixels
    # @frame.bounds.x1 = 364
    # @frame.bounds.x2 = 964
    # @frame.bounds.y1 = 1106
    # @frame.bounds.y2 = 1506

    @padding.bounds.x1 = @frame.bounds.x1 + @playerPadding
    @padding.bounds.x2 = @frame.bounds.x2 - @playerPadding
    @padding.bounds.y1 = @frame.bounds.y1 + @playerPadding
    @padding.bounds.y2 = @frame.bounds.y2 - @playerPadding

    return this

  # Shifts the frame and padding bounds by the given vector.
  #
  # Examples:
  #
  #   shiftBounds(x: 20)
  #   shiftBounds(x: 2, y: -9)
  #
  shiftBounds: (vec) ->
    @frame.bounds.shift(vec)
    @padding.bounds.shift(vec)

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
    diff = @frame.bounds.moveTo(key, val)
    @padding.bounds.shift(diff)

  debug: ->
    console.log "viewport.frame.bounds = (#{@frame.bounds.x1}..#{@frame.bounds.x2}, #{@frame.bounds.y1}..#{@frame.bounds.y2})"
    console.log "viewport.padding.bounds = (#{@padding.bounds.x1}..#{@padding.bounds.x2}, #{@padding.bounds.y1}..#{@padding.bounds.y2})"


