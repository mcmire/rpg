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

  # Moves the bounds of the viewport frame by the given vector.
  #
  # The "move" event is also triggered, which is currently used by the collision
  # layer to shift the collision box overlay along with the map.
  #
  # Examples:
  #
  #   shiftBounds('x', 20)
  #   shiftBounds(x: 2, y: -9)
  #
  shiftBounds: (args...) ->
    ret = @frame.boundsOnMap.shift(args...)
    $(this).trigger('move')
    return ret

  # Moves the bounds of the viewport frame by a vector such that the given
  # bound corner ends up being the given value. The bound corner on the other
  # side of the given bound corner is moved proportionally.
  #
  # The "move" event is also triggered, which is currently used by the collision
  # layer to shift the collision box overlay along with the map.
  #
  # Returns the distance the bounds were moved.
  #
  # Examples:
  #
  #   moveBoundsTo('x1', 80)
  #   moveBoundsTo('y2', 3)
  #
  moveBoundsTo: (key, val) ->
    ret = @frame.boundsOnMap.moveTo(key, val)
    $(this).trigger('move')
    return ret

  inspect: ->
    JSON.stringify(
      "frame.boundsOnMap": @frame.boundsOnMap.inspect()
      "padding.boundsInFrame": @padding.boundsInFrame.inspect()
    )

  debug: ->
    console.log "viewport.frame.bounds = (#{@frame.bounds.x1}..#{@frame.bounds.x2}, #{@frame.bounds.y1}..#{@frame.bounds.y2})"
    console.log "viewport.padding.bounds = (#{@padding.bounds.x1}..#{@padding.bounds.x2}, #{@padding.bounds.y1}..#{@padding.bounds.y2})"


