game = (window.game ||= {})

util = game.util
Mob = game.Mob
{eventable} = game.roles
keyboard = game.keyboard
Bounds = game.Bounds

DIRECTIONS = 'up down left right'.split(' ')

# TODO: Probably can move these shortcuts into keyboard
DIRECTION_KEYS =
  up:    keyboard.keyCodesFor('KEY_W', 'KEY_UP',    'KEY_K')
  down:  keyboard.keyCodesFor('KEY_S', 'KEY_DOWN',  'KEY_J')
  left:  keyboard.keyCodesFor('KEY_A', 'KEY_LEFT',  'KEY_H')
  right: keyboard.keyCodesFor('KEY_D', 'KEY_RIGHT', 'KEY_L')

KEY_DIRECTIONS = {}
for dir in DIRECTIONS
  for keyCode in DIRECTION_KEYS[dir]
    KEY_DIRECTIONS[keyCode] = dir

KEYS = $.flatten($.values(DIRECTION_KEYS))

player = Mob.cloneAs('game.player')

player.addState 'moveLeft',  [0,1,2,3,4,5,6,7],       duration: 2, repeat: true
player.addState 'moveRight', [8,9,10,11,12,13,14,15], duration: 2, repeat: true
player.addState 'moveDown',  [16,17,18,19,20,21,22],  duration: 2, repeat: true
player.addState 'moveUp',    [23,24,25,26,27,28],     duration: 2, repeat: true
player.addState 'idleLeft',  [0],                     duration: 2, repeat: true
player.addState 'idleRight', [8],                     duration: 2, repeat: true
player.addState 'idleDown',  [19],                    duration: 2, repeat: true
player.addState 'idleUp',    [23],                    duration: 2, repeat: true

player.extend \
  eventable,

  viewportPadding: 30
  keyTracker: keyboard.KeyTracker.create(KEYS)

  # TODO: This should be moved to lightworld_map.addPlayer
  __plugged__: (core) ->
    core.collisionLayer.add(this)

  init: ->
    @_super('link2x.gif', 34, 48, 4)
    @setState('idleDown')
    @addEvents()

  # override
  _initBoundsOnMap: ->
    @_super()
    @bounds.onMap = Bounds.at(372, 540, 406, 588)

  # override
  _initFence: ->
    @fence = @viewport.bounds.withScale(@viewportPadding)

  # override
  addEvents: ->
    keyboard.addKeyTracker(@keyTracker)

  # override
  removeEvents: ->
    keyboard.removeKeyTracker(@keyTracker)

  # Respond to keystrokes executed during the "dead time", i.e., the time
  # between the end of the last iteration and the start of this iteration
  predraw: ->
    if keyCode = @keyTracker.getLastPressedKey()
      direction = KEY_DIRECTIONS[keyCode]
      state = 'move' + util.capitalize(direction)
    else
      state = @state.name.replace('move', 'idle')
    if state isnt @state.name
      @setState(state)

    @_super()

  # Internal: Move the position of the player leftward, possibly shifting the
  # viewport to keep the player within it, and also keeping the player from
  # moving beyond the edges of the map and intersecting solid parts of the map
  # and entities moving about.
  #
  # The idea here is that we move the player left within the viewport until it
  # reaches a certain distance away from its left edge -- we say it reaches the
  # fence. When this occurs, we continue the appearance of movement by keeping
  # the player on-screen at the fence and scrolling the viewport leftward over
  # the map. We do this until we've reached the left edge of the map and can
  # scroll no further, at which point we move the player left until it touches
  # the left edge of the map.
  #
  moveLeft: ->
    # Calculate next position of the player moving left
    nextBoundsOnMap = @bounds.onMap.withTranslation(x: -@speed)

    # Would the player cross the right edge of a collision box?
    if x = @allCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)
      # Yes: Move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('x1', x)
      return

    # Would the viewport move beyond the left edge of the map?
    if (@viewport.bounds.x1 - @speed) < 0
      # Yes: Is there another map to load to the left?
      if map = @core.currentMap.getAreaLeft?()
        # Yes: Load it
        @core.currentMap.loadArea(map)
      else
        # No: Put the viewport at the left edge of the map
        @viewport.translateBySide('x1', 0)
        # Would the player cross the left edge of the map?
        if nextBoundsOnMap.x1 < 0
          # Yes: put it at the edge
          @bounds.onMap.translateBySide('x1', 0)
        else
          # No: Move the player right
          @bounds.onMap.replace(nextBoundsOnMap)
    else
      # The viewport is still within the map
      # Move the player left
      @bounds.onMap.replace(nextBoundsOnMap)
      # Would the player cross the left edge of the fence?
      if (@bounds.inViewport.x1 - @speed) < @fence.x1
        # Yes: Shift viewport left.
        #
        # This is not so straightforward as one might think because if the
        # player is less than @speed distance away from the left edge then the
        # viewport needs to shift in such a way as to show the player
        # @viewportPadding distance away from the left edge of the viewport.
        #
        # For example, assuming player.bounds.fence.x1 = 10 and:
        #
        #   player.bounds.inViewport.x1 = 14
        #   player.bounds.onMap.x1 = 114
        #   viewport.bounds.x1 = 100
        #
        # moving the player 10 pixels to the left looks like (o is the current
        # x1 of the player, x is the new x1 position):
        #
        #   map          100 104   110 114
        #   view         0   4     10  14
        #                |         |
        #                |   x-----|---o
        #
        # and so we need to move the viewport bounds so that it looks like
        # this:
        #
        #   map    94    100 104   110
        #   view   0     :   10    :
        #          |     :   |     :
        #          |     :   x     :
        #
        # or, in code, this needs to be true:
        #
        #   player.bounds.inViewport.x1 = 10
        #   player.bounds.onMap.x1 = 104
        #   viewport.bounds.x1 = 94
        #
        @viewport.translateBySide('x1', @bounds.onMap.x1 - @viewportPadding)

  # Internal: Move the player rightward.
  #
  # This is very similar to #moveLeft so see that for more.
  #
  moveRight: ->
    # Calculate next position of the player moving right
    @bounds.onMap.withTranslation(x: +@speed)

    # Would the player cross the left edge of a collision box?
    if x = @allCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)
      # Yes: Move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('x2', x)
      return

    mapWidth = @core.currentMap.width

    # Would the viewport move beyond the right edge of the map?
    if (@viewport.bounds.x2 + @speed) > mapWidth
      # Yes: Is there another map to load to the right?
      if map = @core.currentMap.getAreaRight?()
        # Yes: Load it
        @core.currentMap.loadArea(map)
      else
        # No: Put the viewport at the right edge of the map
        @viewport.translateBySide('x2', mapWidth)
        # Would the player cross the right edge of the map?
        if nextBoundsOnMap.x2 > mapWidth
          # Yes: put it at the edge
          @bounds.onMap.translateBySide('x2', mapWidth)
        else
          # No: Move the player right
          @bounds.onMap.replace(nextBoundsOnMap)
    else
      # The viewport is still within the map
      # No: Move the player right
      @bounds.onMap.replace(nextBoundsOnMap)
      # Would the player cross the right edge of the fence?
      if (@bounds.inViewport.x2 + @speed) > @fence.x2
        # Yes: shift viewport right.
        @viewport.translateBySide('x2', @bounds.onMap.x2 + @viewportPadding)

  # Internal: Move the player upward.
  #
  # This is very similar to #moveLeft so see that for more.
  #
  moveUp: ->
    # Calculate the next position of the player moving up
    nextBoundsOnMap = @bounds.onMap.withTranslation(y: -@speed)

    # Would the player cross the bottom edge of a collision box?
    if y = @allCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('y1', y)
      return

    # Would the viewport move beyond the top edge of the map?
    if (@viewport.bounds.y1 - @speed) < 0
      # Yes: Is there another map to load to the top?
      if map = @core.currentMap.getAreaUp?()
        # Yes: Load it
        @core.currentMap.loadArea(map)
      else
        # No: Put the viewport at the top edge of the map
        @viewport.translateBySide('y1', 0)
        # Would the player cross the top edge of the map?
        if nextBoundsOnMap.y1 < 0
          # Yes: put it at the edge
          @bounds.onMap.translateBySide('y1', 0)
        else
          # No: Move the player up
          @bounds.onMap.replace(nextBoundsOnMap)
    else
      # The viewport is still within the map
      # Move the player up
      @bounds.onMap.replace(nextBoundsOnMap)
      # Would the player cross the top edge of the fence?
      if (@bounds.inViewport.y1 - @speed) < @fence.y1
        # Yes: shift viewport up.
        @viewport.translateBySide('y2', @bounds.onMap.y1 - @viewportPadding)

  # Internal: Move the player downward.
  #
  # This is very similar to #moveLeft so see that for more.
  #
  moveDown: ->
    # Calculate the next position of the player moving down
    nextBoundsOnMap = @bounds.onMap.withTranslation(y: @speed)

    # Would the player cross the top edge of a collision box?
    if y = @allCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)
      # Yes: move it just at the edge so it no longer collides
      @translateBySide('y2', y)
      return

    mapHeight = @core.currentMap.height

    # Would the viewport move beyond the bottom edge of the map?
    if (@viewport.bounds.y2 + @speed) > mapHeight
      # Yes: Is there another map to load to the bottom?
      if map = @core.currentMap.getAreaDown?()
        # Yes: Load it
        @core.currentMap.loadArea(map)
      else
        # No: Put the viewport at the bottom edge of the map
        @viewport.translateBySide('y2', mapHeight)
        # Would the player move beyond the bottom edge of the map?
        if nextBoundsOnMap.y2 > mapHeight
          # Yes: put it at the edge
          @bounds.onMap.translateBySide('y2', mapHeight)
        else
          # No: Move the player down
          @bounds.onMap.replace(nextBoundsOnMap)
    else
      # The viewport is still within the map
      # No: Move the player right
      @bounds.onMap.replace(nextBoundsOnMap)
      # Would the player move beyond the right edge of the fence?
      if (@bounds.inViewport.y2 + @speed) > @fence.y2
        # Yes: shift viewport right.
        @viewport.translateBySide('y2', @bounds.onMap.y2 + @viewportPadding)

game.player = player

window.numScriptsLoaded++
