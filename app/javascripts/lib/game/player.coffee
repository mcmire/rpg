game = window.game
{Bounds} = game

class game.Player
  @speed: 5 # px/frame

  constructor: (@main, spriteSheet, @dimensions) ->
    imagePath = "#{@main.imagesPath}/#{spriteSheet}"
    @spriteSheet = new game.SpriteSheet(imagePath, @dimensions.width, @dimensions.height)
    @spriteSheet.image.onload  = => @isLoaded = true
    @spriteSheet.image.onerror = => throw "Image #{imagePath} failed to load!"

    @action = 'idleRight'
    @animations = {}
    [@spriteWidth, @spriteHeight] = [@dimensions.width, @dimensions.height]

    @bounds = {}
    @lastBounds = {}

    # bounds in viewport
    x1 = 0
    x2 = x1 + @spriteWidth
    y1 = 0
    y2 = y1 + @spriteHeight
    @bounds.inViewport = @lastBounds.inViewport = new Bounds(x1, x2, y1, y2)

    # bounds on map
    x1 = @main.viewport.frame.boundsOnMap.x1 + @bounds.inViewport.x1
    x2 = x1 + @spriteWidth
    y1 = @main.viewport.frame.boundsOnMap.y1 + @bounds.inViewport.y1
    y2 = y1 + @spriteHeight
    @bounds.onMap = new Bounds(x1, x2, y1, y2)

  addAnimation: (name, frequency, frames) ->
    @animations[name] = new game.SpriteAnimation(@spriteSheet, frequency, frames)

  draw: ->
    canvas = @main.viewport.canvas
    canvas.ctx.clearRect(
      @lastBounds.inViewport.x1,
      @lastBounds.inViewport.y1,
      @lastBounds.inViewport.x2,
      @lastBounds.inViewport.y2
    )
    @animations[@action].step(canvas, @bounds.inViewport.x1, @bounds.inViewport.y1)
    @lastBounds.inViewport = @bounds.inViewport.clone()

  # Shifts the viewport and map bounds by the given vector.
  #
  # Examples:
  #
  #   shiftBounds(x: 20)
  #   shiftBounds(x: 2, y: -9)
  #
  shiftBounds: (vec) ->
    @bounds.inViewport.shift(vec)
    @bounds.onMap.shift(vec)

  # Shifts the viewport and map bounds by a vector such that the given key
  # (e.g., "x1", "y2) ends up being the value for the corresponding key
  # in the viewport bound. The map bounds will be re-calculated appropriately.
  #
  # Examples:
  #
  #   moveMapBoundsTo("x2", 2000)
  #   moveMapBoundsTo("y1", 0)
  #
  # Also see:
  #
  #   Bounds#moveTo
  #
  moveMapBoundsTo: (key, val) ->
    [axis, side] = key
    distMoved = @bounds.onMap.moveTo(key, val)
    #distMoved = -distMoved if side is "1"
    @bounds.inViewport.shift(axis, distMoved)

  # The idea here is that we move the player sprite left until it reaches a
  # certain point (we call it the "fence"), after which we continue the
  # appearance of movement by shifting the viewport leftward along the map. We
  # do this until we've reached the left edge of the map and can scroll no
  # longer, at which point we move the player left until it touches the left
  # edge of the map.
  #
  moveLeft: ->
    @action = 'runLeft'

    nextBoundsOnMap = @bounds.onMap.subtract(x: Player.speed)
    nextBoundsInViewport = @bounds.inViewport.subtract(x: Player.speed)
    nextViewportBounds = @main.viewport.frame.boundsOnMap.subtract(x: Player.speed)

    collisionLayer = @main.collisionLayer
    if x = collisionLayer.getBlockingRightEdge(nextBoundsOnMap)
      @moveMapBoundsTo('x1', x+1)
      return

    if nextViewportBounds.x1 < 0
      # Viewport is at the left edge of the map
      @main.viewport.moveBoundsTo('x1', 0)
      if nextBoundsOnMap.x1 < 0
        # Player is at the left edge of the map
        @bounds.onMap.moveTo('x1', 0)
        @bounds.inViewport.moveTo('x1', 0)
      else
        # Move player left
        @shiftBounds(x: -Player.speed)
    else
      leftEdgeOfFence = @main.viewport.padding.boundsInFrame.x1
      if nextBoundsInViewport.x1 < leftEdgeOfFence
        # Player is at the left edge of the fence;
        # shift viewport left
        distMoved = @bounds.inViewport.moveTo('x1', leftEdgeOfFence)
        @bounds.onMap.shift(x: -(Player.speed + distMoved))
        @main.viewport.shiftBounds(x: -(Player.speed + distMoved))
      else
        # Move player left
        @shiftBounds(x: -Player.speed)

  # Similar to moving leftward, we move the player sprite right until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport rightward along the map. We do this until we've reached the
  # right edge of the map and can scroll no longer, at which point we move the
  # player right until it touches the right edge of the map.
  #
  moveRight: ->
    @action = 'runRight'

    nextBoundsOnMap = @bounds.onMap.add(x: Player.speed)
    nextBoundsInViewport = @bounds.inViewport.add(x: Player.speed)
    nextViewportBounds = @main.viewport.frame.boundsOnMap.add(x: Player.speed)

    collisionLayer = @main.collisionLayer
    if x = collisionLayer.getBlockingLeftEdge(nextBoundsOnMap)
      @moveMapBoundsTo('x2', x-1)
      return

    mapWidth = @main.map.width.pixels
    if nextViewportBounds.x2 > mapWidth
      # Viewport is at the right edge of the map
      @main.viewport.moveBoundsTo('x2', mapWidth)
      if nextBoundsOnMap.x2 > mapWidth
        # Player is at the right edge of the map
        @bounds.onMap.moveTo('x2', mapWidth)
        @bounds.inViewport.moveTo('x2', @main.viewport.width.pixels)
      else
        # Move player right
        @shiftBounds(x: Player.speed)
    else
      rightEdgeOfFence = @main.viewport.padding.boundsInFrame.x2
      if nextBoundsInViewport.x2 > rightEdgeOfFence
        # Player is at the right side of the fence;
        # shift viewport right
        distMoved = @bounds.inViewport.moveTo('x2', rightEdgeOfFence)
        @bounds.onMap.shift(x: Player.speed - distMoved)
        @main.viewport.shiftBounds(x: Player.speed - distMoved)
      else
        # Move player right
        @shiftBounds(x: Player.speed)

  # Similar to moving leftward, we move the player sprite upward until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport upward along the map. We do this until we've reached the top
  # edge of the map and can scroll no longer, at which point we move the player
  # up until it touches the top edge of the map.
  #
  moveUp: ->
    @action = 'runUp'

    nextBoundsOnMap = @bounds.onMap.subtract(y: Player.speed)
    nextBoundsInViewport = @bounds.inViewport.subtract(y: Player.speed)
    nextViewportBounds = @main.viewport.frame.boundsOnMap.subtract(y: Player.speed)

    collisionLayer = @main.collisionLayer
    if y = collisionLayer.getBlockingBottomEdge(nextBoundsOnMap)
      @moveMapBoundsTo('y1', y+1)
      return

    if nextViewportBounds.y1 < 0
      # Viewport is at the top edge of the map
      @main.viewport.moveBoundsTo('y1', 0)
      if nextBoundsOnMap.y1 < 0
        # Player is at the top edge of the map
        @bounds.onMap.moveTo('y1', 0)
        @bounds.inViewport.moveTo('y1', 0)
      else
        # Move player top
        @shiftBounds(y: -Player.speed)
    else
      topEdgeOfFence = @main.viewport.padding.boundsInFrame.y1
      if nextBoundsInViewport.y1 < topEdgeOfFence
        # Player is at the top edge of the fence;
        # shift viewport up
        distMoved = @bounds.inViewport.moveTo('y1', topEdgeOfFence)
        @bounds.onMap.shift(y: -(Player.speed - distMoved))
        @main.viewport.shiftBounds(y: -(Player.speed - distMoved))
      else
        # Move player top
        @shiftBounds(y: -Player.speed)

  # Similar to moving leftward, we move the player sprite downward until it
  # hits the fence, after which we continue the appearance of movement by
  # shifting the viewport downward along the map. We do this until we've reached
  # the bottom edge of the map and can scroll no longer, at which point we move
  # the player down until it touches the bottom edge of the map.
  #
  moveDown: ->
    @action = 'runDown'

    nextBoundsOnMap = @bounds.onMap.add(y: Player.speed)
    nextBoundsInViewport = @bounds.inViewport.add(y: Player.speed)
    nextViewportBounds = @main.viewport.frame.boundsOnMap.add(y: Player.speed)

    collisionLayer = @main.collisionLayer
    if y = collisionLayer.getBlockingTopEdge(nextBoundsOnMap)
      @moveMapBoundsTo('y2', y-1)
      return

    mapHeight = @main.map.height.pixels
    if nextViewportBounds.y2 > mapHeight
      # Viewport is at the bottom edge of the map
      @main.viewport.moveBoundsTo('y2', mapHeight)
      if nextBoundsOnMap.y2 > mapHeight
        # Player is at the bottom edge of the map
        @bounds.onMap.moveTo('y2', mapHeight)
        @bounds.inViewport.moveTo('y2', @main.viewport.height.pixels)
      else
        # Move player bottom
        @shiftBounds(y: Player.speed)
    else
      bottomEdgeOfFence = @main.viewport.padding.boundsInFrame.y2
      if nextBoundsInViewport.y2 > bottomEdgeOfFence
        # Player is at the bottom side of the fence;
        # shift viewport down
        distMoved = @bounds.inViewport.moveTo('y2', bottomEdgeOfFence)
        @bounds.onMap.shift(y: Player.speed - distMoved)
        @main.viewport.shiftBounds(y: Player.speed - distMoved)
      else
        # Move player bottom
        @shiftBounds(y: Player.speed)

  inspect: ->
    JSON.stringify(
      "bounds.inViewport": @bounds.inViewport.inspect(),
      "bounds.onMap": @bounds.onMap.inspect()
    )

  debug: ->
    console.log "player.bounds.inViewport = #{@bounds.inViewport.inspect()}"
    console.log "player.bounds.OnMap = #{@bounds.onMap.inspect()}"

class game.Link extends game.Player
  constructor: ->
    super
    @addAnimation('idleRight', 4, [8])
    @addAnimation('runRight', 4, [8,9,10,11,12,13,14,15])
    @addAnimation('runLeft', 4, [0,1,2,3,4,5,6,7])
    @addAnimation('runDown', 4, [16,17,18,19,20,21,22])
    @addAnimation('runUp', 4, [23,24,25,26,27,28])
