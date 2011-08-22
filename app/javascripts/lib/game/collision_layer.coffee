game = window.game
{Canvas} = game

game.util.module "game.CollisionLayer",
  init: (@main) ->
    unless @isInit
      @isLoaded = false
      #[@width, @height] = [10, 10]  # just temporary for now
      @width = @main.viewport.width.pixels
      @height = @main.viewport.height.pixels

      @imagePath = "#{@main.imagesPath}/mask.gif"
      @_loadImage =>
        #@_createCollisionRanges()
      @collisionRanges = [
        # Note that y2 is offset by 8 pixels (16 pixels at 2x scale)
        {x1: 96, x2: 352, y1: 79, y2: 108}
      ]

      c = @debugCanvas = Canvas.create(@width, @height)
      for range in @collisionRanges
        c.ctx.beginPath()
        c.ctx.moveTo(range.x1-0.5, range.y1-0.5)
        c.ctx.lineTo(range.x2-0.5, range.y1-0.5)
        c.ctx.lineTo(range.x2-0.5, range.y2-0.5)
        c.ctx.lineTo(range.x1-0.5, range.y2-0.5)
        c.ctx.lineTo(range.x1-0.5, range.y1-0.5)
        c.ctx.strokeStyle = "#ff0000"
        c.ctx.stroke()

      @$debugMask = $('<div />')
        .css('width', @width)
        .css('height', @height)
        .css('background-image', 'url(/images/mask.gif)')
        .css('background-repeat', 'no-repeat')

      @isInit = true
    return this

  isCollision: (x, y) ->
    for range in @collisionRanges
      return true if range.x1 <= x <= range.x2 and range.y1 <= y <= range.y2
    return false

  # This method will be called with the x-value of the right edge of an
  # entity when is moving rightward. Here we look at the left edge of
  # each collision box; if the x-value crosses one of them, then we
  # return true, otherwise we return false.
  #
  isLeftEdgeCollision: (x, y) ->
    for range in @collisionRanges
      return true if range.y1 >= y <= range.y2 and range.x1 <= x <= range.x2
    return false

  # This method will be called with the x-value of the left edge of an
  # entity when is moving leftward. Here we look at the right edge of
  # each collision box; if the x-value crosses one of them, then we
  # return true, otherwise we return false.
  #
  isRightEdgeCollision: (x) ->
    for range in @collisionRanges
      return true if x > range.x1 and x <= range.x2
    return false

  # This method will be called with the y-value of the bottom edge of an
  # entity when is moving downward. Here we look at the top edge of each
  # collision box; if the y-value crosses one of them, then we return
  # true, otherwise we return false.
  #
  isTopEdgeCollision: (y) ->
    for range in @collisionRanges
      return true if y < range.y2 and y >= range.y1
    return false

  # This method will be called with the y-value of the bottom edge of an
  # entity when is moving downward. Here we look at the top edge of each
  # collision box; if the y-value crosses one of them, then we return
  # true, otherwise we return false.
  #
  isBottomEdgeCollision: (y) ->
    for range in @collisionRanges
      return true if y > range.y1 and y <= range.y2
    return false

  _loadImage: (success) ->
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
  _createCollisionRanges: ->
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

    ranges.push(range) if range

    @collisionRanges = ranges
