{Bounds, Mob, SpriteSheet} = game = window.game

DIRECTIONS = 'right down left up'.split(' ')

class game.Enemy extends Mob
  @extended()

  @image: 'enemy2x.gif'
  @width: 40
  @height: 56
  @speed: 3  # px/frame

  # parens are necessary here, otherwise CS gets confused when it hits the
  # 'constructor:' bit below
  # CS 1.1.0 might fix this
  @addState('moveDown',
    frames: [0,1],
    duration: 4,
    repeat: true,
    move: true)
  @addState('downToRight',
    frames: [0,2],
    duration: 24,
    then: 'moveRight')
  @addState('downToLeft',
    frames: [0,3],
    duration: 24,
    then: 'moveLeft')
  @addState('moveRight',
    frames: [4,5],
    duration: 4,
    repeat: true,
    move: true)
  @addState('rightToUp',
    frames: [4,6],
    duration: 24,
    then: 'moveUp')
  @addState('rightToDown',
    frames: [4,7],
    duration: 24,
    then: 'moveDown')
  @addState('moveLeft',
    frames: [8,9],
    duration: 4,
    repeat: true,
    move: true)
  @addState('leftToDown',
    frames: [8,10],
    duration: 24,
    then: 'moveDown')
  @addState('leftToUp',
    frames: [8,11],
    duration: 24,
    then: 'moveUp')
  @addState('moveUp',
    frames: [12,13],
    duration: 4,
    repeat: true,
    move: true)
  @addState('upToLeft',
    frames: [12,14],
    duration: 24,
    then: 'moveLeft')
  @addState('upToRight',
    frames: [12,15],
    duration: 24,
    then: 'moveRight')

  constructor: ->
    super
    @setState('moveRight')
    @_directionChangeNeeded = false
    @_chooseSequenceLength()

  # override
  initFence: ->
    @bounds.fenceOnMap = Bounds.fromDims(300, 300, 100, 100)

  # override
  initTopLeftBoundsOnMap: ->
    self = this
    fn = ->
      x1 = $.randomInt(self.bounds.fenceOnMap.x1, self.bounds.fenceOnMap.x2)
      y1 = $.randomInt(self.bounds.fenceOnMap.y1, self.bounds.fenceOnMap.y2)
      self.bounds.onMap.anchor(x1, y1)
    # poor man's do-while :(
    fn(); fn() while @collisionLayerBoxes.intersectsWith(@bounds.onMap)

  # Internal: Move the position of the entity leftward, keeping the entity from
  # moving beyond the edges of the map and intersecting solid parts of the map
  # and other entities moving about.
  #
  moveLeft: ->
    @direction = 'left'

    nextBoundsOnMap = @bounds.onMap.withTranslation(x: -@speed)

    # Would the player hit the right edge of a collision box or the left edge of
    # the fence?
    if (
      (x = @collisionLayerBoxes.getOuterRightEdgeBlocking(nextBoundsOnMap)) or
      (x = @bounds.fenceOnMap.getInnerLeftEdgeBlocking(nextBoundsOnMap))
    )
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('x1', x)
      # Also choose another direction since we can't go any further
      @_directionChangeNeeded = true
    else
      # No: Move it normally
      @bounds.onMap.replace(nextBoundsOnMap)

  # Internal: Move the position of the entity rightward, keeping the entity from
  # moving beyond the edges of the map and intersecting solid parts of the map
  # and other entities moving about.
  #
  moveRight: ->
    @direction = 'right'

    nextBoundsOnMap = @bounds.onMap.withTranslation(x: +@speed)

    # Would the player hit the left edge of a collision box or the right edge
    # of the fence?
    if (
      (x = @collisionLayerBoxes.getOuterLeftEdgeBlocking(nextBoundsOnMap)) or
      (x = @bounds.fenceOnMap.getInnerRightEdgeBlocking(nextBoundsOnMap))
    )
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('x2', x)
      # Also choose another direction since we can't go any further
      @_directionChangeNeeded = true
    else
      # No: Move it normally
      @bounds.onMap.replace(nextBoundsOnMap)

  # Internal: Move the position of the entity upward, keeping the entity from
  # moving beyond the edges of the map and intersecting solid parts of the map
  # and other entities moving about.
  #
  moveUp: ->
    @direction = 'up'

    nextBoundsOnMap = @bounds.onMap.withTranslation(y: -@speed)

    # Would the player hit the bottom edge of a collision box or the top edge of
    # the fence?
    if (
      (y = @collisionLayerBoxes.getOuterBottomEdgeBlocking(nextBoundsOnMap)) or
      (y = @bounds.fenceOnMap.getInnerTopEdgeBlocking(nextBoundsOnMap))
    )
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('y1', y)
      # Also choose another direction since we can't go any further
      @_directionChangeNeeded = true
    else
      # No: Move it normally
      @bounds.onMap.replace(nextBoundsOnMap)

  # Internal: Move the position of the entity downward, keeping the entity from
  # moving beyond the edges of the map and intersecting solid parts of the map
  # and other entities moving about.
  #
  moveDown: ->
    @direction = 'down'

    nextBoundsOnMap = @bounds.onMap.withTranslation(y: +@speed)

    # Would the player hit the top edge of a collision box or the bottom edge of
    # the fence?
    if (
      (y = @collisionLayerBoxes.getOuterTopEdgeBlocking(nextBoundsOnMap)) or
      (y = @bounds.fenceOnMap.getInnerBottomEdgeBlocking(nextBoundsOnMap))
    )
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('y2', y)
      # Also choose another direction since we can't go any further
      @_directionChangeNeeded = true
    else
      # No: Move it normally
      @bounds.onMap.replace(nextBoundsOnMap)

  # draw: ->
  #   super
  #   fenceInViewport = @main.mapBoundsToViewportBounds(@bounds.fenceOnMap)
  #   fenceInViewport.draw(@main)

  # override
  postdraw: ->
    if @_directionChangeNeeded or @numSeqFrameDraws is @sequenceLength
      @_directionChangeNeeded = false
      @_chooseAnotherDirection()
    else
      super

  _chooseAnotherDirection: ->
    validDirections = switch @direction
      when 'up', 'down'    then ['left', 'right']
      when 'left', 'right' then ['up', 'down']
    direction = $.capitalize $.randomItem(validDirections)
    @setState("#{@direction}To#{direction}")
    @_chooseSequenceLength()

  _chooseSequenceLength: ->
    @sequenceLength = $.randomInt(40, 80)
