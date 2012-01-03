game = window.game
{Canvas, EventHelpers, Bounds} = game

collisionLayer = game.util.module "game.collisionLayer", [EventHelpers]

collisionLayer.init = (@main) ->
  unless @isInit
    @isLoaded = false
    @viewport = @main.viewport
    #[@width, @height] = [10, 10]  # just temporary for now
    @width = @viewport.width.pixels
    @height = @viewport.height.pixels

    @imagePath = "#{@main.imagesPath}/mask.gif"
    @_loadImage =>
      #@_createCollisionBoxes()
    @collisionBoxes = [
      Bounds.fromCoords(96, 96, 352, 112)
    ]

    # @_createDebugOverlay()

    @isInit = true
  return this

collisionLayer.addEvents = ->
  self = this
  # @bindEvents @viewport, move: -> self.draw()

collisionLayer.removeEvents = ->
  # @unbindEvents @viewport, 'move'

collisionLayer.attachTo = (element) ->
  # $(element).append(@$debugOverlay)

collisionLayer.detach = ->
  # @debugOverlay.$element.detach()

collisionLayer.add = (bounds) ->
  @collisionBoxes.push(bounds)

collisionLayer.draw = ->
  bom = @viewport.frame.boundsOnMap
  positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ")
  @$debugOverlay.css('background-position', positionStr)
  #self.collisionLayer.$debugMask.css('background-position', positionStr)
  #self.canvas.ctx.drawImage(self.collisionLayer.debugCanvas.element, 0, 0)

# Public: Calculate the pixel amount required to correct a bounds box heading
# in a direction toward a box on the collision layer such that it buts against
# it rather than intersecting it.
#
# This is used when moving the player so that it does not collide with a box in
# the collision layer.
#
# direction - A String: 'up', 'down', 'left' or 'right'.
# bounds    - The calculated next Bounds of the player.
#
# Returns a positive integer if the Bounds collides with a collision box, or 0
# otherwise.
#
collisionLayer.offsetToNotCollide = (direction, bounds) ->
  switch direction
    when 'left'
      bounds.x1 - @getBlockingRightEdge(bounds)
    when 'right'
      @getBlockingLeftEdge(bounds) - bounds.x2
    when 'up'
      @getBlockingBottomEdge(bounds) - bounds.y2
    when 'down'
      bounds.y1 - @getBlockingTopEdge(bounds)

# Public: Return whether the given bounds intersects with a box in the collision
# layer.
#
# The collision should be detected correctly whether the given box is taller or
# shorter than the collision box in question.
#
# b - An instance of Bounds.
#
# Returns true or false.
#
collisionLayer.isIntersection = (b) ->
  for box in @collisionBoxes
    one   = (box.x1 <= b.x1 <= box.x2)
    two   = (box.x1 <= b.x2 <= box.x2)
    three = (box.y1 <= b.y1 <= box.y2)
    four  = (box.y1 <= b.y2 <= box.y2)
    return true if ((one or two) and (three or four))
  return false

# Public: Calculate a value that should be subtracted from the x1 coordinate of
# a bounds box to prevent it from colliding with a box in the collision layer
# when moving rightward.
#
# The collision should be detected correctly whether the given box is taller or
# shorter than the collision box in question. In other words, both of these
# cases are prevented:
#
#        E     B           E     B
#             ____        ____
#      ______|_   |   => |   _|_____
#   => |     : |  |   => |  : |     |
#   => |_____:_|  |   => |  :_|_____|
#            |____|   => |____|
#
# b - An instance of Bounds.
#
# Returns the integer X-coordinate of the left side of the collision box that
# the given box collides with if one exists, or null otherwise.
#
collisionLayer.getBlockingLeftEdge = (b) ->
  for box in @collisionBoxes
    return box.x1 if (
      # (b.x1 <= box.x1 and b.x2 >= box.x1) and
      (b.x1 <= box.x1 <= b.x2) and
      (
        (box.y1 <= b.y1 <= box.y2) or
        (box.y1 <= b.y2 <= box.y2) or
        (b.y1 < box.y1 and b.y2 > box.y2)
      )
    )
  return null

# Public: Calculate a value that should be subtracted from the x2 coordinate of
# a bounds box to prevent it from colliding with a box in the collision layer
# when moving leftward.
#
# The collision should be detected correctly whether the given box is taller or
# shorter than the collision box in question. In other words, both of these
# cases are prevented:
#
#     B     E            B     E
#    ____                    ____
#   |   _|_____        _____|_   | <=
#   |  | :     | <=   |     | :  | <=
#   |  |_:_____| <=   |_____|_:  | <=
#   |____|                  |____| <=
#
# bounds - An instance of Bounds.
#
# Returns the integer X-coordinate of the right side of the collision box that
# the given box collides with if one exists, or null otherwise.
#
collisionLayer.getBlockingRightEdge = (b) ->
  for box in @collisionBoxes
    return box.x2 if (
      # (b.x1 <= box.x2 and b.x2 >= box.x2) and
      (b.x1 <= box.x2 <= b.x2) and
      (
        (box.y1 <= b.y1 <= box.y2) or
        (box.y1 <= b.y2 <= box.y2) or
        (b.y1 < box.y1 and b.y2 > box.y2)
      )
    )
  return null

# Public: Calculate a value that should be subtracted from the y2 coordinate of
# a bounds box to prevent it from colliding with a box in the collision layer
# when moving downward.
#
# The collision should be detected correctly whether the given box is taller or
# shorter than the collision box in question. In other words, both of these
# cases are prevented:
#
#        |  |               |  |
#        v  v               v  v
#        ____             ________
#   E   |    |        E  |  ....  |
#      _|....|_          |_|____|_|
#   B | |____| |      B    |    |
#     |________|           |____|
#
# bounds - An instance of Bounds.
#
# Returns the integer Y-coordinate of the top side of the collision box that the
# given box collides with if one exists, or null otherwise.
#
collisionLayer.getBlockingTopEdge = (b) ->
  for box in @collisionBoxes
    return box.y1 if (
      # (b.y1 <= box.y1 and b.y2 >= box.y1) and
      (b.y1 <= box.y1 <= b.y2) and
      (
        (box.x1 <= b.x1 <= box.x2) or
        (box.x1 <= b.x2 <= box.x2) or
        (b.x1 < box.x1 and b.x2 > box.x2)
      )
    )
  return null

# Public: Calculate a value that should be subtracted from the y1 coordinate of
# a bounds box to prevent it from colliding with a box in the collision layer
# when moving upward.
#
# The collision should be detected correctly whether the given box is taller or
# shorter than the collision box in question. In other words, both of these
# cases are prevented:
#
#       ________           ____
#   B  |  ____  |     B   |    |
#      |_|....|_|        _|____|_
#   E    |    |       E | |....| |
#        |____|         |________|
#         ^  ^             ^  ^
#         |  |             |  |
#
# bounds - An instance of Bounds.
#
# Returns the integer Y-coordinate of the bottom side of the collision box that
# the given box collides with if one exists, or null otherwise.
#
collisionLayer.getBlockingBottomEdge = (b) ->
  for box in @collisionBoxes
    return box.y2 if (
      # (b.y1 <= box.y2 and b.y2 >= box.y2) and
      (b.y1 <= box.y2 <= b.y2) and
      (
        (box.x1 <= b.x1 <= box.x2) or
        (box.x1 <= b.x2 <= box.x2) or
        (b.x1 < box.x1 and b.x2 > box.x2)
      )
    )
  return null

collisionLayer._createDebugOverlay = ->
  map = @viewport.main.map
  [width, height] = [map.width.pixels, map.height.pixels]
  @$debugOverlay = $('<div id="collision-layer-debug-overlay" />')
    .css(width: width, height: height)
  @debugOverlayCanvas = Canvas.create(width, height)
  c = @debugOverlayCanvas.ctx
  c.strokeStyle = "#ff0000"
  for box in @collisionBoxes
    c.strokeRect(box.x1+0.5, box.y1+0.5, box.x2-box.x1, box.y2-box.y1)
  @$debugOverlay.css('background-image', "url(#{@debugOverlayCanvas.element.toDataURL()})")

collisionLayer._loadImage = (success) ->
  @image = document.createElement('img')
  @image.src = @imagePath
  @image.onload = =>
    @isLoaded = true
    success()
  @image.onerror = => throw "Image #{imagePath} failed to load!"

# The collision mask is a monochromatic image where non-transparent
# pixels represent areas where the player may not pass through. Here,
# we go through through the image line by line, pixel by pixel, and
# subdivide the image into boxes. Each box will then become a range of
# coordinates in both axes. So we end up with a left edge, right edge,
# top edge and bottom edge, or x1, x2, y1, y2. We can then use these
# ranges to determine whether or not an entity crosses one of the
# boxes in the collision layer.
#---
# TODO...........
#
collisionLayer._createCollisionBoxes = ->
  canvas = Canvas.create(@width, @height)
  canvas.ctx.drawImage(@image, 0, 0)
  imageData = canvas.ctx.getImageData(0, 0, @width, @height)

  boxes = []
  openBoxes = []
  openLine = null
  boxIdx = null
  lastY = null

  # There are six states here:
  #
  # * this pixel is transparent and no last pixel
  # * this pixel is transparent and last pixel was transparent
  # * this pixel is transparent and last pixel was not transparent
  # * this pixel is not transparent and no last pixel
  # * this pixel is not transparent and last pixel was transparent
  # * this pixel is not transparent and last pixel was not transparent
  #
  imageData.each (pixel) ->
    if pixel.y != lastY
      # new row, start current box index over
      boxIdx = 0

    if pixel.isTransparent()
      if openLine
        openBoxes.push(openLine)
        openLine = null
    else
      if openLine
        # last pixel was not transparent, extend range
        openLine[1] = pixel.x
      else
        # last pixel was transparent, start new range
        if openBoxes.length
          curBox = openBoxes[boxIdx]
        else
          curBox = {x1: pixel.x, y1: pixel.y}
          openBoxes.push(curBox)
        curBox.x2 = pixel.x
        curBox.y2 = pixel.y
    lastY = pixel.y

  boxes.push(box) if box

  @collisionBoxes = boxes
