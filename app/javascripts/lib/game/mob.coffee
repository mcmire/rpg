{Bounds} = game = window.game

class game.Mob
  @states: {}
  @addState: (name, args) ->
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
    {@viewport, @map, @collisionLayer} = @main

    @imagePath = "#{@main.imagesPath}/#{@constructor.image}"
    @image = new Image(); @image.src = @imagePath
    @width = @constructor.width
    @height = @constructor.height
    @speed = @constructor.speed

    @_initBounds()

    @addEvents()

    @isLoaded = false

  _initBounds: ->
    @bounds = {}
    @lastBounds = {}
    @bounds.onMap = @lastBounds.onMap = new Bounds(@width, @height)
    @bounds.inViewport = @lastBounds.inViewport = new Bounds(@width, @height)

    @initFence()
    @initTopLeftBoundsOnMap()
    @initTopLeftBoundsInViewport()

  initTopLeftBoundsOnMap: ->
    @bounds.onMap.anchor(0, 0)

  initTopLeftBoundsInViewport: ->
    @_recalculateViewportBounds()

  _recalculateViewportBounds: ->
    # take the bounds.onMap and map them to viewport bounds
    bom = @bounds.onMap
    vb = @main.viewport.frameBoundsOnMap
    x1 = bom.x1 - vb.x1
    y1 = bom.y1 - vb.y1
    @bounds.inViewport.anchor(x1, y1)

  initFence: ->
    @bounds.fenceOnMap = new Bounds(
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
    @state = @constructor.states[name]
    throw new Error "Unknown state '#{name}'!" if not @state
    @currentFrame = 0
    @numFramesDrawn = 0

  tick: ->
    @predraw()
    @draw()
    @postdraw()

  predraw: ->
    ctx = @viewport.canvas.ctx
    lbiv = @lastBounds.inViewport
    ctx.clearRect(lbiv.x1, lbiv.y1, lbiv.x2, lbiv.y2)

    @[@state.moveHandler]?()

    @lastBounds.inViewport = @bounds.inViewport.clone()

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
    # ctx.strokeRect(x+0.5, y+0.5, width, height)

    ctx.restore()

  postdraw: ->
    if (@numFramesDrawn % @state.frameDuration) is 0
      @currentFrame++

    if @currentFrame is @state.numFrames
      if @state.doesRepeat
        @currentFrame = 0
      else
        if @state.afterFinish
          @setState(@state.afterFinish)
        else
          throw new Error "No after finish state set for '#{@state.name}'!"

    @numFramesDrawn++

  # Shifts the viewport and map bounds by the given vector.
  #
  # Examples:
  #
  #   translateBounds(x: 20)
  #   translateBounds(x: 2, y: -9)
  #
  translateBounds: (vec) ->
    @bounds.inViewport.translate(vec)
    @bounds.onMap.translate(vec)

  # Shifts the viewport and map bounds by a vector such that the given key
  # (e.g., "x1", "y2) ends up being the value for the corresponding key
  # in the viewport bound. The map bounds will be re-calculated appropriately.
  #
  # Examples:
  #
  #   moveBoundsCorner("x2", 2000)
  #   moveBoundsCorner("y1", 0)
  #
  # Also see:
  #
  #   Bounds#moveTo
  #
  moveBoundsCorner: (key, val) ->
    [axis, side] = key
    distMoved = @bounds.onMap.moveCorner(key, val)
    @bounds.inViewport.translate(axis, distMoved)

  inspect: ->
    JSON.stringify(
      "bounds.inViewport": @bounds.inViewport.inspect(),
      "bounds.onMap": @bounds.onMap.inspect()
    )

  debug: ->
    console.log "player.bounds.inViewport = #{@bounds.inViewport.inspect()}"
    console.log "player.bounds.OnMap = #{@bounds.onMap.inspect()}"
