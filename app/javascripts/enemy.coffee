{Bounds, Mob, SpriteSheet} = game = window.game

DIRECTIONS = 'right down left up'.split(' ')

class game.Enemy extends Mob
  @extended()

  @image: 'enemy1.gif'
  @width: 20
  @height: 28
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
    duration: 16,
    then: 'moveRight')
  @addState('downToLeft',
    frames: [0,3],
    duration: 16,
    then: 'moveLeft')
  @addState('moveRight',
    frames: [4,5],
    duration: 4,
    repeat: true,
    move: true)
  @addState('rightToUp',
    frames: [4,6],
    duration: 16,
    then: 'moveUp')
  @addState('rightToDown',
    frames: [4,7],
    duration: 16,
    then: 'moveDown')
  @addState('moveLeft',
    frames: [8,9],
    duration: 4,
    repeat: true,
    move: true)
  @addState('leftToDown',
    frames: [8,10],
    duration: 16,
    then: 'moveDown')
  @addState('leftToUp',
    frames: [8,11],
    duration: 16,
    then: 'moveUp')
  @addState('moveUp',
    frames: [12,13],
    duration: 4,
    repeat: true,
    move: true)
  @addState('upToLeft',
    frames: [12,14],
    duration: 16,
    then: 'moveLeft')
  @addState('upToRight',
    frames: [12,15],
    duration: 16,
    then: 'moveRight')

  constructor: ->
    super
    # @changeToWandering()
    @setState('moveRight')
    # @direction = $.randomItem(DIRECTIONS)
    # @directionIndex = 0

  # override
  initFence: ->
    @bounds.fenceOnMap = new Bounds(200, 200, 100, 100)

  # override
  initTopLeftBoundsOnMap: ->
    self = this
    fn = ->
      x1 = $.randomInt(self.bounds.fenceOnMap.x1, self.bounds.fenceOnMap.x2)
      y1 = $.randomInt(self.bounds.fenceOnMap.y1, self.bounds.fenceOnMap.y2)
      self.bounds.onMap.anchor(x1, y1)
    # poor man's do-while :(
    fn(); fn() while @collisionLayer.isIntersection(@bounds.onMap)

  # changeToWandering: ->
  #   @state = 'wandering'
  #   @numSteps = 0
  #   @stepsToWalk = $.randomInt(10)

  postdraw: ->
    super

    # # can we keep the current state?
    # if bounds = @_nextValidMove()
    #   # yes, update position
    #   @bounds.onMap = bounds
    #   @_recalculateViewportBounds()
    # else
    #   # no, so change direction
    #   possibleDirections = Array.subtract(DIRECTIONS, @direction)
    #   direction = @_chooseValidDirectionFrom(possibleDirections)
    #   @_transitionTo(direction)

    if @state.doesMove and @numFramesDrawn > 20
      i = (DIRECTIONS.indexOf(@direction) + 1) % DIRECTIONS.length
      nextDirection = $.capitalize DIRECTIONS[i]
      @setState("#{@direction}To#{nextDirection}")

  moveUp: ->
    @direction = 'up'
    @bounds.onMap.translate(y: -@speed)

  moveDown: ->
    @direction = 'down'
    @bounds.onMap.translate(y: +@speed)

  moveLeft: ->
    @direction = 'left'
    @bounds.onMap.translate(x: -@speed)

  moveRight: ->
    @direction = 'right'
    @bounds.onMap.translate(x: +@speed)

  #------------

  ## TODO

  _chooseValidDirectionFrom: (directions) ->
    validDirections = $.every directions, (dir) -> !!@_nextValidMove(dir)
    $.randomItem(validDirections)

  _move: (direction) ->
    [dx, dy] = [0, 0]
    switch direction
      when 'right'
        axis = 'x'
        dx = +@speed
      when 'left'
        axis = 'x'
        dx = -@speed
      when 'up'
        axis = 'y'
        dy = -@speed
      when 'down'
        axis = 'y'
        dy = +@speed
    @bounds.onMap.withTranslation(x: dx, y: dy)
    @spriteSheet.useSequence("move_#{direction}")

  _nextValidMove: (direction) ->
    [dx, dy] = [0, 0]
    switch direction
      when 'right'
        axis = 'x'
        dx = +@speed
      when 'left'
        axis = 'x'
        dx = -@speed
      when 'up'
        axis = 'y'
        dy = -@speed
      when 'down'
        axis = 'y'
        dy = +@speed

    nextBoundsOnMap = @bounds.onMap.withTranslation(x: dx, y: dy)
    offset = (
      # hey, it rhymes
      @collisionLayer.offsetToNotCollide(direction, nextBoundsOnMap) or
      @bounds.onMap.offsetToKeepInside(direction, nextBoundsOnMap)
    )
    return nextBoundsOnMap.withTranslation(axis, -offset)

  _transitionTo: (direction) ->
    @spriteSheet.useSequence("#{@direction}-to-#{direction}")

  _outsideBoundsOnMap: (bounds) ->
    bounds.x1 < @bounds.onMap.x1 or bounds.x2 > @bounds.onMap.x2 or \
    bounds.y1 < @bounds.onMap.y1 or bounds.y2 > @bounds.onMap.y2

