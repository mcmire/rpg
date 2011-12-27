{EventHelpers, Canvas, Bounds} = game = window.game

viewport = game.util.module "game.viewport", [EventHelpers]

viewport.playerPadding = 30  # pixels

viewport.init = (@main) ->
  unless @isInit
    @width = @main.dim(600, 'pixels')
    @height = @main.dim(400, 'pixels')

    # formerly @frame.boundsOnMap
    @frameBoundsOnMap = new Bounds(@width.pixels, @height.pixels)

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

viewport.destroy = ->
  if @isInit
    @reset()
    @isInit = false
  return this

viewport.attachTo = (element) ->
  $(element).append(@$element)

viewport.detach = ->
  @$element.detach()

viewport.draw = ->
  bom = @frameBoundsOnMap
  positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ")
  @$element.css('background-position', positionStr)

# Moves the bounds of the viewport frame by the given vector.
#
# The "move" event is also triggered, which is currently used by the collision
# layer to shift the collision box overlay along with the map.
#
# Examples:
#
#   translateBounds('x', 20)
#   translateBounds(x: 2, y: -9)
#
viewport.translateBounds = (args...) ->
  ret = @frameBoundsOnMap.translate(args...)
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
#   moveBoundsCorner('x1', 80)
#   moveBoundsCorner('y2', 3)
#
viewport.moveBoundsCorner = (key, val) ->
  ret = @frameBoundsOnMap.moveCorner(key, val)
  $(this).trigger('move')
  return ret

viewport.inspect = ->
  JSON.stringify(
    "frameBoundsOnMap": @frameBoundsOnMap.inspect()
  )

viewport.debug = ->
  console.log "viewport.frame.bounds = (#{@frame.bounds.x1}..#{@frame.bounds.x2}, #{@frame.bounds.y1}..#{@frame.bounds.y2})"
  console.log "viewport.padding.bounds = (#{@padding.bounds.x1}..#{@padding.bounds.x2}, #{@padding.bounds.y1}..#{@padding.bounds.y2})"
