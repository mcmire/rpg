{EventHelpers, Canvas, Bounds} = game = window.game

viewport = game.util.module "game.viewport", [EventHelpers]

viewport.playerPadding = 30  # pixels

viewport.init = (@main) ->
  unless @isInit
    @width = @main.dim(600, 'pixels')
    @height = @main.dim(400, 'pixels')

    @bounds = new Bounds(@width.pixels, @height.pixels)

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
  bom = @bounds
  positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ")
  @$element.css('background-position', positionStr)

# Public: Move the bounds of the viewport.
#
# Signatures:
#
# translate(axis, amount)
#
#   axis   - A String: 'x' or 'y'.
#   amount - An integer by which to move the bounds in the axis.
#
# translate(obj)
#
#   obj - Object:
#         x - An integer by which to move x1 and x2 (optional).
#         y - An integer by which to move y1 and y2 (optional).
#
# Examples:
#
#   translateBounds('x', 20)
#   translateBounds(x: 2, y: -9)
#
# Returns the self-same Viewport.
#
# Also see Bounds#translate.
#
viewport.translate = (args...) ->
  @bounds.translate(args...)
  return this

# Public: Move the X- or Y- bounds of the viewport by specifying the position
# of one side.
#
# side  - A String name of the side of the bounds: 'x1', 'x2', 'y1', or 'y2'.
# value - An integer. The `side` is set to the `value`, and the corresponding
#         sides are moved accordingly.
#
# Returns the integer distance the bounds were moved.
#
# Also see Bounds#translateBySide.
#
viewport.translateBySide = (side, value) ->
  @bounds.translateBySide(side, value)

viewport.inspect = ->
  JSON.stringify(
    "bounds": @bounds.inspect()
  )

viewport.debug = ->
  console.log "viewport.frame.bounds = (#{@frame.bounds.x1}..#{@frame.bounds.x2}, #{@frame.bounds.y1}..#{@frame.bounds.y2})"
  console.log "viewport.padding.bounds = (#{@padding.bounds.x1}..#{@padding.bounds.x2}, #{@padding.bounds.y1}..#{@padding.bounds.y2})"
