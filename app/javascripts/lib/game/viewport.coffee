game = window.game
{EventHelpers, Canvas, Bounds} = game

game.util.module "game.Viewport", [EventHelpers],
  playerPadding: 30  # pixels

  init: (@main) ->
    unless @isInit
      @width = @main.dim(600, 'pixels')
      @height = @main.dim(400, 'pixels')

      @frame = {}
      bom = @frame.boundsOnMap = new Bounds(0, @width.pixels, 0, @height.pixels)

      @padding = {}
      @padding.boundsInFrame = new Bounds(
        bom.x1 + @playerPadding
        bom.x2 - @playerPadding
        bom.y1 + @playerPadding
        bom.y2 - @playerPadding
      )

      @$element = $('<div id="viewport" />').css(
        width: @width.pixels
        height: @height.pixels
        'background-image': "url(#{@main.imagesPath}/map2x.png)"
        'background-repeat': 'no-repeat'
      )
      @canvas = Canvas.create(@width.pixels, @height.pixels)
      @canvas.element.id = 'canvas'
      @$element.append(@canvas.$element)

      @isInit = true
    return this

  destroy: ->
    if @isInit
      @reset()
      @isInit = false
    return this

  attachTo: (element) ->
    $(element).append(@$element)

  detach: ->
    @$element.detach()

  draw: ->
    bom = @frame.boundsOnMap
    positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ")
    @$element.css('background-position', positionStr)

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
    $(this).trigger('move')

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


