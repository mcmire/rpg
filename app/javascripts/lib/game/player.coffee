game = window.game

class game.Player
  constructor: (@main) ->
    imagePath = "#{@main.imagesPath}/link2x.gif"
    @spriteSheet = new game.SpriteSheet(imagePath, 34,48)
    @spriteSheet.image.onload = => @isLoaded = true
    @spriteSheet.image.onerror = => throw "Image #{imagePath} failed to load!"
    @action = 'idleRight'
    @animations = {}
    @animations['idleRight'] = new game.SpriteAnimation(@spriteSheet, 4, [8])
    @animations['runRight']  = new game.SpriteAnimation(@spriteSheet, 4, [8,9,10,11,12,13,14,15])
    @animations['runLeft'] = new game.SpriteAnimation(@spriteSheet, 4, [0,1,2,3,4,5,6,7])
    @animations['runDown'] = new game.SpriteAnimation(@spriteSheet, 4, [16,17,18,19,20,21,22])
    @animations['runUp'] = new game.SpriteAnimation(@spriteSheet, 4, [23,24,25,26,27,28])

    @spriteWidth = 16
    @spriteHeight = 24

    @viewport = {
      pos: {x: 0, y: 0}
      offset: {x: 0, y: 0}
    }
    @map = {
      pos: {x: 0, y: 0}
      width: @main.mapWidth
      height: @main.mapHeight
    }
    @speed = 7  # px/frame

    @_initWithinViewport()

  _initWithinViewport: ->
    # Initialize the player's position on the map
    # @viewport.pos.x = @main.viewport.width.pixels / 2
    # @viewport.pos.y = @main.viewport.height.pixels / 2
    @viewport.pos.x = 0
    @viewport.pos.y = 0

  initOnMap: ->
    @map.pos.x = @main.viewport.bounds.x1 + @viewport.pos.x
    @map.pos.y = @main.viewport.bounds.y1 + @viewport.pos.y

  draw: ->
    console.log(@action)
    @animations[@action].step(@viewport.pos.x, @viewport.pos.y)
    # @main.canvas.ctx.drawImage(@sprite, 0, 0, 17, 24, @viewport.pos.x, @viewport.pos.y, 17, 24)

  # The idea here is that we move the player sprite left until it reaches a
  # certain point (we call it the "fence"), after which we continue the
  # appearance of movement by shifting the viewport leftward along the map. We
  # do this until we've reached the left edge of the map and can scroll no
  # longer, at which point we move the player left until it touches the left
  # edge of the map.
  #
  moveLeft: ->
    @action = 'runLeft'

    # return if @_collidesMovingLeftAt(@map.pos.x - @speed)
    return if @main.collisionLayer.isCollision(@map.pos.x - @speed, @map.pos.y)

    if (@main.viewport.bounds.x1 - @speed) >= 0
      if (@viewport.pos.x - @speed) >= @main.viewport.playerPadding
        # Move player left
        @viewport.pos.x -= @speed
        @viewport.offset.x -= @speed
      else
        # Player has hit fence: shift viewport left
        @main.viewport.bounds.x1 -= @speed
        @main.viewport.bounds.x2 -= @speed
      @map.pos.x -= @speed
    else if (@viewport.pos.x - @speed) >= 0
      # Left edge of map hit: move player left
      @viewport.pos.x -= @speed
      @viewport.offset.x -= @speed
      @map.pos.x -= @speed
    else
      # Put player at left edge of map
      @viewport.pos.x -= @viewport.pos.x
      @viewport.offset.x -= @viewport.pos.x
      @map.pos.x -= @viewport.pos.x

  _collidesMovingLeftAt: (x) ->
    @main.collisionLayer.isRightEdgeCollision(x)

  # Similar to moving leftward, we move the player sprite right until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport rightward along the map. We do this until we've reached the
  # right edge of the map and can scroll no longer, at which point we move the
  # player right until it touches the right edge of the map.
  #
  moveRight: ->
    @action = 'runRight'

    # return if @_collidesMovingRightAt(@map.pos.x + @spriteWidth + @speed)
    return if @main.collisionLayer.isCollision(@map.pos.x + @spriteWidth + @speed, @map.pos.y)

    if (@main.viewport.bounds.x2 + @speed) <= @main.map.width.pixels
      if (@main.viewport.width.pixels - (@viewport.pos.x + @spriteWidth + @speed)) >= @main.viewport.playerPadding
        # Move player right
        @viewport.pos.x += @speed
        @viewport.offset.x += @speed
      else
        # Player has hit fence: shift viewport right
        @main.viewport.bounds.x1 += @speed
        @main.viewport.bounds.x2 += @speed
      @map.pos.x += @speed
    else
      dist = (@viewport.pos.x + @spriteWidth) - @main.viewport.width.pixels
      if (dist + @speed) < 0
        # Right edge of map hit: move player right
        @viewport.pos.x += @speed
        @viewport.offset.x += @speed
        @map.pos.x += @speed
      else
        # Put player at right edge of map
        @viewport.pos.x += -dist
        @viewport.offset.x += -dist
        @map.pos.x += -dist

  _collidesMovingRightAt: (x) ->
    @main.collisionLayer.isLeftEdgeCollision(x)

  # Similar to moving leftward, we move the player sprite upward until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport upward along the map. We do this until we've reached the top
  # edge of the map and can scroll no longer, at which point we move the player
  # up until it touches the top edge of the map.
  #
  moveUp: ->
    @action = 'runUp'

    # return if @_collidesMovingUpAt(@map.pos.y - @speed)
    return if @main.collisionLayer.isCollision(@map.pos.x, @map.pos.y - @speed)

    if (@main.viewport.bounds.y1 - @speed) >= 0
      if (@viewport.pos.y - @speed) >= @main.viewport.playerPadding
        # Move player up
        @viewport.pos.y -= @speed
        @viewport.offset.y -= @speed
      else
        # Player has hit fence: shift viewport up
        @main.viewport.bounds.y1 -= @speed
        @main.viewport.bounds.y2 -= @speed
      @map.pos.y -= @speed
    else if (@viewport.pos.y - @speed) >= 0
      # Left edge of map hit: move player up
      @viewport.pos.y -= @speed
      @viewport.offset.y -= @speed
      @map.pos.y -= @speed
    else
      # Put player at top edge of map
      @viewport.pos.y -= @viewport.pos.y
      @viewport.offset.y -= @viewport.pos.y
      @map.pos.y -= @viewport.pos.y

  _collidesMovingUpAt: (y) ->
    @main.collisionLayer.isBottomEdgeCollision(y)

  # Similar to moving leftward, we move the player sprite downward until it
  # hits the fence, after which we continue the appearance of movement by
  # shifting the viewport downard along the map. We do this until we've reached
  # the bottom edge of the map and can scroll no longer, at which point we move
  # the player down until it touches the bottom edge of the map.
  #
  moveDown: ->
    @action = 'runDown'

    # return if @_collidesMovingDownAt(@map.pos.y + @spriteHeight + @speed)
    return if @main.collisionLayer.isCollision(@map.pos.x, @map.pos.y + @spriteHeight + @speed)

    if (@main.viewport.bounds.y2 + @speed) <= @main.map.height.pixels
      if (@main.viewport.height.pixels - (@viewport.pos.y + @spriteHeight + @speed)) >= @main.viewport.playerPadding
        # Move player down
        @viewport.pos.y += @speed
        @viewport.offset.y += @speed
      else
        # Player has hit fence: shift viewport down
        @main.viewport.bounds.y1 += @speed
        @main.viewport.bounds.y2 += @speed
      @map.pos.y += @speed
    else
      dist = (@viewport.pos.y + @spriteHeight) - @main.viewport.height.pixels
      if (dist + @speed) < 0
        # Bottom edge of map hit: move player down
        @viewport.pos.y += @speed
        @viewport.offset.y += @speed
        @map.pos.y += @speed
      else
        # Put player at bottom edge of map
        @viewport.pos.y += -dist
        @viewport.offset.y += -dist
        @map.pos.y += -dist

  _collidesMovingDownAt: (y) ->
    @main.collisionLayer.isTopEdgeCollision(y)

  debug: ->
    console.log "@viewport.pos = (#{@main.viewport.pos.x}, #{@main.viewport.pos.y})"

