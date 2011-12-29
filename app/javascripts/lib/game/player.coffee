{keyboard, Mob, SpriteSheet} = game = window.game

DIRECTIONS = 'up down left right'.split(' ')

DIRECTION_KEYS =
  up:    keyboard.keyCodesFor('KEY_W', 'KEY_UP',    'KEY_K')
  down:  keyboard.keyCodesFor('KEY_S', 'KEY_DOWN',  'KEY_J')
  left:  keyboard.keyCodesFor('KEY_A', 'KEY_LEFT',  'KEY_H')
  right: keyboard.keyCodesFor('KEY_D', 'KEY_RIGHT', 'KEY_L')

KEY_DIRECTIONS = {}
for dir in DIRECTIONS
  for key in DIRECTION_KEYS[dir]
    KEY_DIRECTIONS[key] = dir

KEYS = $.flatten($.values(DIRECTION_KEYS))

class Player extends Mob
  constructor: ->
    @speed = 7  # px/frame
    @viewportPadding = 30  # pixels
    @keyTracker = new keyboard.KeyTracker(KEYS)
    @state = 'idle'
    @direction = 'right'
    super

  # override
  initFence: ->
    @bounds.fenceOnMap = @viewport.frameBoundsOnMap.withScale(@viewportPadding)

  # Override to add animations
  initSpriteSheet: ->
    @spriteSheet = new SpriteSheet(this, 'link2x.gif', 34, 48)

    @spriteSheet.addSequence 'runLeft',   4, [0,1,2,3,4,5,6,7],       repeat: true
    @spriteSheet.addSequence 'runRight',  4, [8,9,10,11,12,13,14,15], repeat: true
    @spriteSheet.addSequence 'runDown',   4, [16,17,18,19,20,21,22],  repeat: true
    @spriteSheet.addSequence 'runUp',     4, [23,24,25,26,27,28],     repeat: true
    @spriteSheet.addSequence 'idleLeft',  4, [0],                     repeat: true
    @spriteSheet.addSequence 'idleRight', 4, [8],                     repeat: true
    @spriteSheet.addSequence 'idleDown',  4, [19],                    repeat: true
    @spriteSheet.addSequence 'idleUp',    4, [23],                    repeat: true

  # override
  destroy: ->
    @removeEvents()

  # override
  addEvents: ->
    # keyboard.trapKeys $.values(mkeys)
    keyboard.addKeyTracker(@keyTracker)

  # override
  removeEvents: ->
    # keyboard.releaseKeys $.values(mkeys)
    keyboard.removeKeyTracker(@keyTracker)

  # override
  onAdded: ->
    @addEvents()

  update: ->
    # directions = @_determineDirections()

    # if directions.crisscross
    #   action = directions.updown
    #   action = null
    #   for dir in directions.crisscross
    #     @[action]()
    #   @spriteSheet.useSequence(action)
    # else if dir = @lastDirections.all[0]
    #   action = "idle" + $.capitalize(dir)
    #   @[action]()
    #   @spriteSheet.useSequence(action)

    # @lastDirections = $.clone(directions)

    someKeyPressed = false
    if keyCode = @keyTracker.getLastPressedKey()
      @direction = KEY_DIRECTIONS[keyCode]
      someKeyPressed = true
    @state = if someKeyPressed then 'move' else 'idle'
    action = @state + "_" + @direction
    @[action]()

  _determineDirections: ->
    directions = {}
    directions.crisscross = []
    directions.all = []

    if keyboard.isKeyPressed(upKeys)
      directions.up = true
      directions.updown = -1
      directions.crisscross.unshift('up')
      directions.all.unshift('up')
    else if keyboard.isKeyPressed(downKeys)
      directions.down = true
      directions.updown = 1
      directions.crisscross.unshift('down')
      directions.all.unshift('down')

    if keyboard.isKeyPressed(leftKeys)
      directions.left = true
      directions.leftright = -1
      directions.crisscross.unshift('left')
      directions.all.unshift('left')
    else if keyboard.isKeyPressed(rightKeys)
      directions.right = true
      directions.leftright = 1
      directions.crisscross.unshift('right')
      directions.all.unshift('right')

    directions.any = (directions.updown or directions.leftright)

    return directions

  # The idea here is that we move the player sprite left until it reaches a
  # certain point (we call it the "fence"), after which we continue the
  # appearance of movement by shifting the viewport leftward along the map. We
  # do this until we've reached the left edge of the map and can scroll no
  # longer, at which point we move the player left until it touches the left
  # edge of the map.
  #
  moveLeft: ->
    @spriteSheet.useSequence('runLeft')

    # dist = Math.round(@speed * @main.msSinceLastDraw)
    dist = @speed

    nextBoundsOnMap = @bounds.onMap.withTranslation(x: -dist)
    nextBoundsInViewport = @bounds.inViewport.withTranslation(x: -dist)
    nextViewportBounds = @viewport.frameBoundsOnMap.withTranslation(x: -dist)

    if x = @collisionLayer.getBlockingRightEdge(nextBoundsOnMap)
      @moveBoundsCorner('x1', x+1)
      return

    if nextViewportBounds.x1 < 0
      # Viewport is at the left edge of the map
      @viewport.moveBoundsCorner('x1', 0)
      if nextBoundsOnMap.x1 < 0
        # Player is at the left edge of the map
        @bounds.onMap.moveCorner('x1', 0)
        @bounds.inViewport.moveCorner('x1', 0)
      else
        # Move player left
        @translateBounds(x: -dist)
    else
      leftEdgeOfFence = @bounds.fenceOnMap.x1
      if nextBoundsInViewport.x1 < leftEdgeOfFence
        # Player is at the left edge of the fence;
        # shift viewport left
        distMoved = @bounds.inViewport.moveCorner('x1', leftEdgeOfFence)
        @bounds.onMap.translate(x: -(dist + distMoved))
        @viewport.translateBounds(x: -(dist + distMoved))
      else
        # Move player left
        @translateBounds(x: -dist)

  idleLeft: ->
    @spriteSheet.useSequence('idleLeft')

  # Similar to moving leftward, we move the player sprite right until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport rightward along the map. We do this until we've reached the
  # right edge of the map and can scroll no longer, at which point we move the
  # player right until it touches the right edge of the map.
  #
  moveRight: ->
    @spriteSheet.useSequence('runRight')

    # dist = Math.round(@speed * @main.msSinceLastDraw)
    dist = @speed

    nextBoundsOnMap = @bounds.onMap.withTranslation(x: dist)
    nextBoundsInViewport = @bounds.inViewport.withTranslation(x: dist)
    nextViewportBounds = @viewport.frameBoundsOnMap.withTranslation(x: dist)

    if x = @collisionLayer.getBlockingLeftEdge(nextBoundsOnMap)
      @moveBoundsCorner('x2', x-1)
      return

    mapWidth = @map.width.pixels
    if nextViewportBounds.x2 > mapWidth
      # Viewport is at the right edge of the map
      @viewport.moveBoundsCorner('x2', mapWidth)
      if nextBoundsOnMap.x2 > mapWidth
        # Player is at the right edge of the map
        @bounds.onMap.moveCorner('x2', mapWidth)
        @bounds.inViewport.moveCorner('x2', @viewport.width.pixels)
      else
        # Move player right
        @translateBounds(x: dist)
    else
      rightEdgeOfFence = @bounds.fenceOnMap.x2
      if nextBoundsInViewport.x2 > rightEdgeOfFence
        # Player is at the right side of the fence;
        # shift viewport right
        distMoved = @bounds.inViewport.moveCorner('x2', rightEdgeOfFence)
        @bounds.onMap.translate(x: dist - distMoved)
        @viewport.translateBounds(x: dist - distMoved)
      else
        # Move player right
        @translateBounds(x: dist)

  idleRight: ->
    @spriteSheet.useSequence('idleRight')

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

    nextBoundsOnMap = @bounds.onMap.withTranslation(y: -dist)
    nextBoundsInViewport = @bounds.inViewport.withTranslation(y: -dist)
    nextViewportBounds = @viewport.frameBoundsOnMap.withTranslation(y: -dist)

    if y = @collisionLayer.getBlockingBottomEdge(nextBoundsOnMap)
      @moveBoundsCorner('y1', y+1)
      return

    if nextViewportBounds.y1 < 0
      # Viewport is at the top edge of the map
      @viewport.moveBoundsCorner('y1', 0)
      if nextBoundsOnMap.y1 < 0
        # Player is at the top edge of the map
        @bounds.onMap.moveCorner('y1', 0)
        @bounds.inViewport.moveCorner('y1', 0)
      else
        # Move player top
        @translateBounds(y: -dist)
    else
      topEdgeOfFence = @bounds.fenceOnMap.y1
      if nextBoundsInViewport.y1 < topEdgeOfFence
        # Player is at the top edge of the fence;
        # shift viewport up
        distMoved = @bounds.inViewport.moveCorner('y1', topEdgeOfFence)
        @bounds.onMap.translate(y: -(dist - distMoved))
        @viewport.translateBounds(y: -(dist - distMoved))
      else
        # Move player top
        @translateBounds(y: -dist)

  idleUp: ->
    @spriteSheet.useSequence('idleUp')

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

    nextBoundsOnMap = @bounds.onMap.withTranslation(y: dist)
    nextBoundsInViewport = @bounds.inViewport.withTranslation(y: dist)
    nextViewportBounds = @viewport.frameBoundsOnMap.withTranslation(y: dist)

    if y = @collisionLayer.getBlockingTopEdge(nextBoundsOnMap)
      @moveBoundsCorner('y2', y-1)
      return

    mapHeight = @map.height.pixels
    if nextViewportBounds.y2 > mapHeight
      # Viewport is at the bottom edge of the map
      @viewport.moveBoundsCorner('y2', mapHeight)
      if nextBoundsOnMap.y2 > mapHeight
        # Player is at the bottom edge of the map
        @bounds.onMap.moveCorner('y2', mapHeight)
        @bounds.inViewport.moveCorner('y2', @viewport.height.pixels)
      else
        # Move player bottom
        @translateBounds(y: dist)
    else
      bottomEdgeOfFence = @bounds.fenceOnMap.y2
      if nextBoundsInViewport.y2 > bottomEdgeOfFence
        # Player is at the bottom side of the fence;
        # shift viewport down
        distMoved = @bounds.inViewport.moveCorner('y2', bottomEdgeOfFence)
        @bounds.onMap.translate(y: dist - distMoved)
        @viewport.translateBounds(y: dist - distMoved)
      else
        # Move player bottom
        @translateBounds(y: dist)

  idleDown: ->
    @spriteSheet.useSequence('idleDown')

Player::move_up = Player::moveUp
Player::move_down = Player::moveDown
Player::move_left = Player::moveLeft
Player::move_right = Player::moveRight
Player::idle_up = Player::idleUp
Player::idle_down = Player::idleDown
Player::idle_left = Player::idleLeft
Player::idle_right = Player::idleRight

game.Player = Player
