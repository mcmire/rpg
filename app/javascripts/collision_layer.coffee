game = window.game
{Canvas, EventHelpers, Bounds} = game

class CollisionBoxes
  constructor: (@boxes, @box) ->

  each: (fn) ->
    if @box
      for box in @boxes
        if box isnt @box
          ret = fn(box)
          break if ret is false
    else
      for box in @boxes
        ret = fn(box)
        break if ret is false

  get: (index) ->
    @boxes[index]

  push: (box) ->
    @boxes.push(box)

  without: (box) ->
    new CollisionBoxes(@boxes, box)

  # Public: Return whether the given bounds intersects with a box in the collision
  # layer.
  #
  # The collision should be detected correctly whether the given box is taller or
  # shorter than the collision box in question.
  #
  # bounds - An instance of Bounds.
  #
  # Returns true or false.
  #
  intersectsWith: (bounds) ->
    ret = false
    @each (box) ->
      if box.intersectsWith(bounds)
        ret = true
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the x1 coordinate of
  # a bounds box to prevent it from colliding with a box in the collision layer
  # when moving rightward.
  #
  # bounds - An instance of Bounds.
  #
  # Returns the integer X-coordinate of the left side of the collision box that
  # the given box collides with if one exists, or null otherwise.
  #
  getOuterLeftEdgeBlocking: (bounds) ->
    ret = null
    @each (box) ->
      if ret = box.getOuterLeftEdgeBlocking(bounds)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the x2 coordinate of
  # a bounds box to prevent it from colliding with a box in the collision layer
  # when moving leftward.
  #
  # bounds - An instance of Bounds.
  #
  # Returns the integer X-coordinate of the right side of the collision box that
  # the given box collides with if one exists, or null otherwise.
  #
  getOuterRightEdgeBlocking: (bounds) ->
    ret = null
    @each (box) ->
      if ret = box.getOuterRightEdgeBlocking(bounds)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the y2 coordinate of
  # a bounds box to prevent it from colliding with a box in the collision layer
  # when moving downward.
  #
  # bounds - An instance of Bounds.
  #
  # Returns the integer Y-coordinate of the top side of the collision box that the
  # given box collides with if one exists, or null otherwise.
  #
  getOuterTopEdgeBlocking: (bounds) ->
    ret = null
    @each (box) ->
      if ret = box.getOuterTopEdgeBlocking(bounds)
        return false
    return ret

  # Public: Calculate a value that should be subtracted from the y1 coordinate of
  # a bounds box to prevent it from colliding with a box in the collision layer
  # when moving upward.
  #
  # bounds - An instance of Bounds.
  #
  # Returns the integer Y-coordinate of the bottom side of the collision box that
  # the given box collides with if one exists, or null otherwise.
  #
  getOuterBottomEdgeBlocking: (bounds) ->
    ret = null
    @each (box) ->
      if ret = box.getOuterBottomEdgeBlocking(bounds)
        return false
    return ret

#---

class CollisionBox
  constructor: (@bounds) ->

  intersectsWith: (bounds) ->
    @bounds.intersectsWith(bounds)

  getOuterLeftEdgeBlocking: (bounds) ->
    @bounds.getOuterLeftEdgeBlocking(bounds)

  getOuterRightEdgeBlocking: (bounds) ->
    @bounds.getOuterRightEdgeBlocking(bounds)

  getOuterTopEdgeBlocking: (bounds) ->
    @bounds.getOuterTopEdgeBlocking(bounds)

  getOuterBottomEdgeBlocking: (bounds) ->
    @bounds.getOuterBottomEdgeBlocking(bounds)

#---

collisionLayer = game.util.module "game.collisionLayer", [EventHelpers]

collisionLayer.init = (@main) ->
  unless @isInit
    @isLoaded = false
    @viewport = @main.viewport
    #[@width, @height] = [10, 10]  # just temporary for now
    @width = @viewport.width.pixels
    @height = @viewport.height.pixels
    @collisionBoxes = new CollisionBoxes([])

    @imagePath = "#{@main.imagesPath}/mask.gif"
    @_loadImage =>
      #@_createCollisionBoxes()

    # Add boxes manually until we work out the collision mask
    @add Bounds.fromCoords(96, 96, 352, 112)

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

collisionLayer.add = (boundsOrMob) ->
  if boundsOrMob.box?
    box = boundsOrMob.box
  else
    box = new CollisionBox(boundsOrMob)
  @collisionBoxes.push(box)

collisionLayer.draw = ->
  bom = @viewport.frame.boundsOnMap
  positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ")
  @$debugOverlay.css('background-position', positionStr)
  #self.collisionLayer.$debugMask.css('background-position', positionStr)
  #self.canvas.ctx.drawImage(self.collisionLayer.debugCanvas.element, 0, 0)

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

#---

game.CollisionBoxes = CollisionBoxes
game.CollisionBox = CollisionBox
game.collisionLayer = collisionLayer
