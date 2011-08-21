game = window.game

class game.Player
  constructor: (@main) ->
    imagePath = "#{@main.imagesPath}/link.gif"
    @sprite = new Image(imagePath, 65, 188)
    @sprite.src = imagePath
    @sprite.onload = => @main.numEntitiesLoaded++
    @sprite.onerror = => throw "Image #{imagePath} failed to load!"

    @viewport = {
      pos: {x: 0, y: 0}
      offset: {x: 0, y: 0}
      fenceDistance: null
    }
    @map = {
      pos: {x: 0, y: 0}
      width: @main.mapWidth
      height: @main.mapHeight
    }
    @speed = @main.playerSpeed

  initWithinViewport: ->
    # Initialize the player's position on the map
    # @viewport.pos.x = @main.viewport.width.pixels / 2
    # @viewport.pos.y = @main.viewport.height.pixels / 2
    @viewport.pos.x = 0
    @viewport.pos.y = 0

    # Initialize the "fence" distance -- the distance the player can travel from
    # the center of the viewport to the edge of the viewport before it starts
    # scrolling
    @viewport.fenceDistance = (@main.viewport.width.pixels / 2) - @main.viewport.playerPadding

  initOnMap: ->
    @map.pos.x = @main.viewport.bounds.x1 + @viewport.pos.x
    @map.pos.y = @main.viewport.bounds.y1 + @viewport.pos.y

  draw: ->
    @main.canvas.ctx.drawImage(@sprite, 0, 0, 17, 24, @viewport.pos.x, @viewport.pos.y, 17, 24)

  # The idea here is that we move the player sprite left until it reaches a
  # certain point (we call it the "fence"), after which we continue the
  # appearance of movement by shifting the viewport leftward along the map. We
  # do this until we've reached the left edge of the map and can scroll no
  # longer, at which point we move the player left until it touches the left
  # edge of the map.
  #
  moveLeft: ->
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

  # Similar to moving leftward, we move the player sprite right until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport rightward along the map. We do this until we've reached the
  # right edge of the map and can scroll no longer, at which point we move the
  # player right until it touches the right edge of the map.
  #
  moveRight: ->
    if (@main.viewport.bounds.x2 + @speed) <= @main.map.width.pixels
      if (@main.viewport.width.pixels - (@viewport.pos.x + @main.tileSize + @speed)) >= @main.viewport.playerPadding
        # Move player right
        @viewport.pos.x += @speed
        @viewport.offset.x += @speed
      else
        # Player has hit fence: shift viewport right
        @main.viewport.bounds.x1 += @speed
        @main.viewport.bounds.x2 += @speed
      @map.pos.x += @speed
    else
      dist = (@viewport.pos.x + @main.tileSize) - @main.viewport.width.pixels
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

  # Similar to moving leftward, we move the player sprite upward until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport upward along the map. We do this until we've reached the top
  # edge of the map and can scroll no longer, at which point we move the player
  # up until it touches the top edge of the map.
  #
  moveUp: ->
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

  # Similar to moving leftward, we move the player sprite downward until it
  # hits the fence, after which we continue the appearance of movement by
  # shifting the viewport downard along the map. We do this until we've reached
  # the bottom edge of the map and can scroll no longer, at which point we move
  # the player down until it touches the bottom edge of the map.
  #
  moveDown: ->
    if (@main.viewport.bounds.y2 + @speed) <= @main.map.height.pixels
      if (@main.viewport.height.pixels - (@viewport.pos.y + @main.tileSize + @speed)) >= @main.viewport.playerPadding
        # Move player down
        @viewport.pos.y += @speed
        @viewport.offset.y += @speed
      else
        # Player has hit fence: shift viewport down
        @main.viewport.bounds.y1 += @speed
        @main.viewport.bounds.y2 += @speed
      @map.pos.y += @speed
    else
      dist = (@viewport.pos.y + @main.tileSize) - @main.viewport.height.pixels
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

  debug: ->
    console.log "@viewport.pos = (#{@main.viewport.pos.x}, #{@main.viewport.pos.y})"
