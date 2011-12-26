game = window.game
{Bounds} = game

class Mob
  constructor: (@main, spritePath, spriteWidth, spriteHeight) ->
    @viewport = @main.viewport
    @_initSpriteSheet(spritePath, spriteWidth, spriteHeight)
    @_initBounds()
    @isLoaded = false

  draw: ->
    canvas = @viewport.canvas
    canvas.ctx.clearRect(
      @lastBounds.inViewport.x1,
      @lastBounds.inViewport.y1,
      @lastBounds.inViewport.x2,
      @lastBounds.inViewport.y2
    )
    @spriteSheet.draw()
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
    @bounds.inViewport.shift(axis, distMoved)

  inspect: ->
    JSON.stringify(
      "bounds.inViewport": @bounds.inViewport.inspect(),
      "bounds.onMap": @bounds.onMap.inspect()
    )

  debug: ->
    console.log "player.bounds.inViewport = #{@bounds.inViewport.inspect()}"
    console.log "player.bounds.OnMap = #{@bounds.onMap.inspect()}"

  _initBounds: ->
    @bounds = {}
    @lastBounds = {}
    @_initBoundsInViewport()
    @_initBoundsOnMap()

  _initBoundsInViewport: ->
    x1 = 0
    x2 = x1 + @spriteSheet.width
    y1 = 0
    y2 = y1 + @spriteSheet.height
    @bounds.inViewport = @lastBounds.inViewport = new Bounds(x1, x2, y1, y2)

  _initBoundsOnMap: ->
    x1 = @viewport.frame.boundsOnMap.x1 + @bounds.inViewport.x1
    x2 = x1 + @spriteSheet.width
    y1 = @viewport.frame.boundsOnMap.y1 + @bounds.inViewport.y1
    y2 = y1 + @spriteSheet.height
    @bounds.onMap = new Bounds(x1, x2, y1, y2)

class Player extends Mob
  constructor: ->
    super
    @speed = 7  # px/frame

  # The idea here is that we move the player sprite left until it reaches a
  # certain point (we call it the "fence"), after which we continue the
  # appearance of movement by shifting the viewport leftward along the map. We
  # do this until we've reached the left edge of the map and can scroll no
  # longer, at which point we move the player left until it touches the left
  # edge of the map.
  #
  moveLeft: ->
    @spriteSheet.useSequence 'runLeft'

    # dist = Math.round(@speed * @main.msSinceLastDraw)
    dist = @speed

    nextBoundsOnMap = @bounds.onMap.subtract(x: dist)
    nextBoundsInViewport = @bounds.inViewport.subtract(x: dist)
    nextViewportBounds = @viewport.frame.boundsOnMap.subtract(x: dist)

    if x = @main.collisionLayer.getBlockingRightEdge(nextBoundsOnMap)
      @moveMapBoundsTo('x1', x+1)
      return

    if nextViewportBounds.x1 < 0
      # Viewport is at the left edge of the map
      @viewport.moveBoundsTo('x1', 0)
      if nextBoundsOnMap.x1 < 0
        # Player is at the left edge of the map
        @bounds.onMap.moveTo('x1', 0)
        @bounds.inViewport.moveTo('x1', 0)
      else
        # Move player left
        @shiftBounds(x: -dist)
    else
      leftEdgeOfFence = @viewport.padding.boundsInFrame.x1
      if nextBoundsInViewport.x1 < leftEdgeOfFence
        # Player is at the left edge of the fence;
        # shift viewport left
        distMoved = @bounds.inViewport.moveTo('x1', leftEdgeOfFence)
        @bounds.onMap.shift(x: -(dist + distMoved))
        @viewport.shiftBounds(x: -(dist + distMoved))
      else
        # Move player left
        @shiftBounds(x: -dist)

  # Similar to moving leftward, we move the player sprite right until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport rightward along the map. We do this until we've reached the
  # right edge of the map and can scroll no longer, at which point we move the
  # player right until it touches the right edge of the map.
  #
  moveRight: ->
    @spriteSheet.useSequence 'runRight'

    # dist = Math.round(@speed * @main.msSinceLastDraw)
    dist = @speed

    nextBoundsOnMap = @bounds.onMap.add(x: dist)
    nextBoundsInViewport = @bounds.inViewport.add(x: dist)
    nextViewportBounds = @viewport.frame.boundsOnMap.add(x: dist)

    if x = @main.collisionLayer.getBlockingLeftEdge(nextBoundsOnMap)
      @moveMapBoundsTo('x2', x-1)
      return

    mapWidth = @main.map.width.pixels
    if nextViewportBounds.x2 > mapWidth
      # Viewport is at the right edge of the map
      @viewport.moveBoundsTo('x2', mapWidth)
      if nextBoundsOnMap.x2 > mapWidth
        # Player is at the right edge of the map
        @bounds.onMap.moveTo('x2', mapWidth)
        @bounds.inViewport.moveTo('x2', @viewport.width.pixels)
      else
        # Move player right
        @shiftBounds(x: dist)
    else
      rightEdgeOfFence = @viewport.padding.boundsInFrame.x2
      if nextBoundsInViewport.x2 > rightEdgeOfFence
        # Player is at the right side of the fence;
        # shift viewport right
        distMoved = @bounds.inViewport.moveTo('x2', rightEdgeOfFence)
        @bounds.onMap.shift(x: dist - distMoved)
        @viewport.shiftBounds(x: dist - distMoved)
      else
        # Move player right
        @shiftBounds(x: dist)

  # Similar to moving leftward, we move the player sprite upward until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport upward along the map. We do this until we've reached the top
  # edge of the map and can scroll no longer, at which point we move the player
  # up until it touches the top edge of the map.
  #
  moveUp: ->
    @spriteSheet.useSequence('runUp')

    # dist = Math.round(@speed * @main.msSinceLastDraw)
    dist = @speed

    nextBoundsOnMap = @bounds.onMap.subtract(y: dist)
    nextBoundsInViewport = @bounds.inViewport.subtract(y: dist)
    nextViewportBounds = @viewport.frame.boundsOnMap.subtract(y: dist)

    if y = @main.collisionLayer.getBlockingBottomEdge(nextBoundsOnMap)
      @moveMapBoundsTo('y1', y+1)
      return

    if nextViewportBounds.y1 < 0
      # Viewport is at the top edge of the map
      @viewport.moveBoundsTo('y1', 0)
      if nextBoundsOnMap.y1 < 0
        # Player is at the top edge of the map
        @bounds.onMap.moveTo('y1', 0)
        @bounds.inViewport.moveTo('y1', 0)
      else
        # Move player top
        @shiftBounds(y: -dist)
    else
      topEdgeOfFence = @viewport.padding.boundsInFrame.y1
      if nextBoundsInViewport.y1 < topEdgeOfFence
        # Player is at the top edge of the fence;
        # shift viewport up
        distMoved = @bounds.inViewport.moveTo('y1', topEdgeOfFence)
        @bounds.onMap.shift(y: -(dist - distMoved))
        @viewport.shiftBounds(y: -(dist - distMoved))
      else
        # Move player top
        @shiftBounds(y: -dist)

  # Similar to moving leftward, we move the player sprite downward until it
  # hits the fence, after which we continue the appearance of movement by
  # shifting the viewport downward along the map. We do this until we've reached
  # the bottom edge of the map and can scroll no longer, at which point we move
  # the player down until it touches the bottom edge of the map.
  #
  moveDown: ->
    @spriteSheet.useSequence('runDown')

    # dist = Math.round(@speed * @main.msSinceLastDraw)
    dist = @speed

    nextBoundsOnMap = @bounds.onMap.add(y: dist)
    nextBoundsInViewport = @bounds.inViewport.add(y: dist)
    nextViewportBounds = @viewport.frame.boundsOnMap.add(y: dist)

    if y = @main.collisionLayer.getBlockingTopEdge(nextBoundsOnMap)
      @moveMapBoundsTo('y2', y-1)
      return

    mapHeight = @main.map.height.pixels
    if nextViewportBounds.y2 > mapHeight
      # Viewport is at the bottom edge of the map
      @viewport.moveBoundsTo('y2', mapHeight)
      if nextBoundsOnMap.y2 > mapHeight
        # Player is at the bottom edge of the map
        @bounds.onMap.moveTo('y2', mapHeight)
        @bounds.inViewport.moveTo('y2', @viewport.height.pixels)
      else
        # Move player bottom
        @shiftBounds(y: dist)
    else
      bottomEdgeOfFence = @viewport.padding.boundsInFrame.y2
      if nextBoundsInViewport.y2 > bottomEdgeOfFence
        # Player is at the bottom side of the fence;
        # shift viewport down
        distMoved = @bounds.inViewport.moveTo('y2', bottomEdgeOfFence)
        @bounds.onMap.shift(y: dist - distMoved)
        @viewport.shiftBounds(y: dist - distMoved)
      else
        # Move player bottom
        @shiftBounds(y: dist)

  # Override to add animations
  _initSpriteSheet: (spritePath, spriteWidth, spriteHeight) ->
    @spriteSheet = new game.SpriteSheet(this, spritePath, spriteWidth, spriteHeight)
    @spriteSheet.addSequence 'idleRight', 4, [8]
    @spriteSheet.addSequence 'runLeft',   4, [0,1,2,3,4,5,6,7]
    @spriteSheet.addSequence 'runRight',  4, [8,9,10,11,12,13,14,15]
    @spriteSheet.addSequence 'runDown',   4, [16,17,18,19,20,21,22]
    @spriteSheet.addSequence 'runUp',     4, [23,24,25,26,27,28]
    @spriteSheet.useSequence 'idleRight'

game.Mob    = Mob
game.Player = Player
