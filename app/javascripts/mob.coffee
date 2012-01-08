{Bounds, CollisionBox} = game = window.game

class game.Mob
  @extended = ->
    # Create these when the Mob class is extended instead in the body of the Mob
    # class because otherwise @states will be shared across all subclasses
    @states = {}
    @addState = (name, args) ->
      state = {}
      state.name = name
      state.frameDuration = args.duration or args.frameDuration or 1
      state.frames = args.frames
      state.numFrames = state.frames.length
      state.doesRepeat = args.repeat or args.doesRepeat
      state.afterFinish = args.then
      state.doesMove = args.move or args.doesMove
      if state.moveHandler
        state.doesMove = true
      else if state.doesMove
        state.moveHandler = name
      @states[name] = state

  constructor: (@main) ->
    {@viewport, @map} = @main

    @isLoaded = false

    @imagePath = "#{@main.imagesPath}/#{@constructor.image}"
    @image = new Image(); @image.src = @imagePath
    @width = @constructor.width
    @height = @constructor.height
    @speed = @constructor.speed

    @_initBounds()

    @addEvents()

  _initBounds: ->
    @bounds = {}
    @lastBounds = {}
    @bounds.onMap = @lastBounds.onMap = Bounds.fromDims(@width, @height)
    @bounds.inViewport = @lastBounds.inViewport = Bounds.fromDims(@width, @height)

    @box = new CollisionBox(@bounds.onMap)
    @collisionLayerBoxes = @main.collisionLayer.collisionBoxes.without(@box)

    @initFence()
    @initTopLeftBoundsOnMap()
    @initTopLeftBoundsInViewport()

  initTopLeftBoundsOnMap: ->
    @bounds.onMap.anchor(0, 0)

  initTopLeftBoundsInViewport: ->
    @_recalculateViewportBounds()

  _recalculateViewportBounds: ->
    @bounds.inViewport = @main.mapBoundsToViewportBounds(@bounds.onMap)

  initFence: ->
    @bounds.fenceOnMap = Bounds.fromDims(
      @main.map.width.pixels,
      @main.map.height.pixels
    )

  destroy: ->
    # does nothing by default

  addEvents: ->
    self = this
    @image.onload  = -> self.isLoaded = true
    @image.onerror = -> throw "Image #{self.imagePath} failed to load!"

  removeEvents: ->
    # does nothing by default

  onAdded: ->
    # does nothing by default

  setState: (name) ->
    # console.log "Setting state to #{name}"
    @state = @constructor.states[name]
    throw new Error "Unknown state '#{name}'!" if not @state
    @currentFrame = 0
    @numSeqFrameDraws = 0

  tick: ->
    @predraw()
    @draw()
    @postdraw()

  predraw: ->
    ctx = @viewport.canvas.ctx
    lbiv = @lastBounds.inViewport
    ctx.clearRect(lbiv.x1, lbiv.y1, @width, @height)

    @[@state.moveHandler]?()

    # the position on the map may have changed, as well as the viewport
    # frame bounds, so we need to do this
    @_recalculateViewportBounds()

  draw: ->
    ctx = @viewport.canvas.ctx
    biv = @bounds.inViewport

    ctx.save()

    frame = @state.frames[@currentFrame]
    unless frame?
      debugger
      throw 'frame is undefined'
    yOffset = frame * @height
    ctx.drawImage(@image, 0, yOffset, @width, @height, biv.x1, biv.y1, @width, @height)

    # DEBUG
    # ctx.strokeStyle = '#00ff00'
    # ctx.strokeRect(biv.x1+0.5, biv.y1+0.5, @width, @height)

    ctx.restore()

  postdraw: ->
    if (@numSeqFrameDraws % @state.frameDuration) is 0
      @currentFrame++

    if @currentFrame is @state.numFrames
      if @state.doesRepeat
        @currentFrame = 0
      else
        if @state.afterFinish
          @setState(@state.afterFinish)
        else
          throw new Error "No after finish state set for '#{@state.name}'!"

    @lastBounds.inViewport = @bounds.inViewport.clone()

    @numSeqFrameDraws++

  # Public: Move the viewport and map bounds of the player.
  #
  # Signatures:
  #
  # translate(axis, amount)
  #
  #   axis   - A String: 'x' or 'y'.
  #   amount - An integer by which to move the bounds in the axis.
  #
  # translate(obj)
  #
  #   obj - Object:
  #         x - An integer by which to move x1 and x2 (optional).
  #         y - An integer by which to move y1 and y2 (optional).
  #
  # Examples:
  #
  #   translateBounds('x', 20)
  #   translateBounds(x: 2, y: -9)
  #
  # Returns the self-same Viewport.
  #
  # Also see Bounds#translate.
  #
  translate: (args...) ->
    @bounds.inViewport.translate(args...)
    @bounds.onMap.translate(args...)

  # Public: Move the X- or Y- bounds of the player by specifying the position
  # of one side of the map bounds. The viewport bounds will be moved
  # accordingly.
  #
  # side  - A String name of the side of the bounds: 'x1', 'x2', 'y1', or 'y2'.
  # value - An integer. The `side` is set to the `value`, and the corresponding
  #         sides are moved accordingly.
  #
  # Returns the integer distance the bounds were moved.
  #
  # Also see Bounds#translateBySide.
  #
  translateBySide: (side, value) ->
    axis = side[0]
    distMoved = @bounds.onMap.translateBySide(side, value)
    @bounds.inViewport.translate(axis, distMoved)
    return distMoved

  inspect: ->
    JSON.stringify(
      "bounds.inViewport": @bounds.inViewport.inspect(),
      "bounds.onMap": @bounds.onMap.inspect()
    )

  debug: ->
    console.log "player.bounds.inViewport = #{@bounds.inViewport.inspect()}"
    console.log "player.bounds.OnMap = #{@bounds.onMap.inspect()}"
