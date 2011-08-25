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
        #@_createCollisionBoxes()
      @collisionBoxes = [
        {x1: 96, x2: 352, y1: 96, y2: 112}
      ]

      c = @debugCanvas = Canvas.create(@width, @height)
      for box in @collisionBoxes
        c.ctx.beginPath()
        c.ctx.moveTo(box.x1+0.5, box.y1+0.5)
        c.ctx.lineTo(box.x2+0.5, box.y1+0.5)
        c.ctx.lineTo(box.x2+0.5, box.y2+0.5)
        c.ctx.lineTo(box.x1+0.5, box.y2+0.5)
        c.ctx.lineTo(box.x1+0.5, box.y1+0.5)
        c.ctx.strokeStyle = "#ff0000"
        c.ctx.stroke()

      @$debugMask = $('<div />')
        .css('width', @width)
        .css('height', @height)
        .css('background-image', 'url(/images/mask.gif)')
        .css('background-repeat', 'no-repeat')

      @isInit = true
    return this

  # Called when an entity is moving right. Given the coordinates of an entity in
  # the position it is about to be moved to, returns the left edge of a box on
  # the collision layer that the coordinates collide with. This edge (which is
  # an X-value in this case) will then be used to position the entity
  # appropriately.
  #
  # The collision should be detected correctly whether the entity is taller
  # than the colliding box, or shorter. In other words, both of these cases are
  # prevented:
  #
  #        E     B           E     B
  #             ____        ____
  #      ______|_   |   => |   _|_____
  #   => |     : |  |   => |  : |     |
  #   => |_____:_|  |   => |  :_|_____|
  #            |____|   => |____|
  #
  getBlockingLeftEdge: (e) ->
    for box in @collisionBoxes
      return box.x1 if (
        (e.x1 <= box.x1 and e.x2 >= box.x1) and
        (
          (box.y1 <= e.y1 <= box.y2) or
          (box.y1 <= e.y2 <= box.y2) or
          (e.y1 < box.y1 and e.y2 > box.y2)
        )
      )
    return null

  # Called when an entity is moving left. Given the coordinates of an entity in
  # the position it is about to be moved to, returns the right edge of a box on
  # the collision layer that the coordinates collide with. This edge (which is
  # an X-value in this case) will then be used to position the entity
  # appropriately.
  #
  # The collision should be detected correctly whether the entity is taller
  # than the colliding box, or shorter. In other words, both of these cases are
  # prevented:
  #
  #     B     E            B     E
  #    ____                    ____
  #   |   _|_____        _____|_   | <=
  #   |  | :     | <=   |     | :  | <=
  #   |  |_:_____| <=   |_____|_:  | <=
  #   |____|                  |____| <=
  #
  getBlockingRightEdge: (e) ->
    for box in @collisionBoxes
      return box.x2 if (
        (e.x1 <= box.x2 and e.x2 >= box.x2) and
        (
          (box.y1 <= e.y1 <= box.y2) or
          (box.y1 <= e.y2 <= box.y2) or
          (e.y1 < box.y1 and e.y2 > box.y2)
        )
      )
    return null

  # Called when an entity is moving down. Given the coordinates of an entity in
  # the position it is about to be moved to, returns the top edge of a box on
  # the collision layer that the coordinates collide with. This edge (which is
  # an Y-value in this case) will then be used to position the entity
  # appropriately.
  #
  # The collision should be detected correctly whether the entity is taller
  # than the colliding box, or shorter. In other words, both of these cases are
  # prevented:
  #
  #        |  |               |  |
  #        v  v               v  v
  #        ____             ________
  #   E   |    |        E  |  ....  |
  #      _|....|_          |_|____|_|
  #   B | |____| |      B    |    |
  #     |________|           |____|
  #
  getBlockingTopEdge: (e) ->
    for box in @collisionBoxes
      return box.y1 if (
        (e.y1 <= box.y1 and e.y2 >= box.y1) and
        (
          (box.x1 <= e.x1 <= box.x2) or
          (box.x1 <= e.x2 <= box.x2) or
          (e.x1 < box.x1 and e.x2 > box.x2)
        )
      )
    return null

  # Called when an entity is moving up. Given the coordinates of an entity in
  # the position it is about to be moved to, returns the bottom edge of a box on
  # the collision layer that the coordinates collide with. This edge (which is
  # an Y-value in this case) will then be used to position the entity
  # appropriately.
  #
  # The collision should be detected correctly whether the entity is taller
  # than the colliding box, or shorter. In other words, both of these cases are
  # prevented:
  #
  #       ________           ____
  #   B  |  ____  |     B   |    |
  #      |_|....|_|        _|____|_
  #   E    |    |       E | |....| |
  #        |____|         |________|
  #         ^  ^             ^  ^
  #         |  |             |  |
  #
  getBlockingBottomEdge: (e) ->
    for box in @collisionBoxes
      return box.y2 if (
        (e.y1 <= box.y2 and e.y2 >= box.y2) and
        (
          (box.x1 <= e.x1 <= box.x2) or
          (box.x1 <= e.x2 <= box.x2) or
          (e.x1 < box.x1 and e.x2 > box.x2)
        )
      )
    return null

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
  _createCollisionBoxes: ->
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
