game = window.game
{Keyboard, DOMEventHelpers, Canvas, CollisionLayer, Player} = game

defaults = {}

_dim = (value, unit) ->
  d = {}
  switch unit
    when "tile", "tiles"
      d.tiles = value;
      d.pixels = value * defaults.tileSize
    when "pixel", "pixels"
      d.pixels = value;
      d.tiles = value / defaults.tileSize
  return d

defaults.drawInterval  = 30   # ms/frame
defaults.tileSize      = 64   # pixels
defaults.playerPadding = 30   # pixels

defaults.imagesPath = "/images"

defaults.mapLoaded = false
defaults.entities = []

defaults.mapWidth = _dim(2560, 'pixels')
defaults.mapHeight = _dim(1600, 'pixels')

# defaults.viewportWidth  = _dim(24, 'tiles')
# defaults.viewportHeight = _dim(16, 'tiles')
defaults.viewportWidth = _dim(600, 'pixels')
defaults.viewportHeight = _dim(400, 'pixels')
# defaults.viewportWidth = defaults.mapWidth
# defaults.viewportHeight = defaults.mapHeight

defaults.debug = false

game.util.module "game.Main", [DOMEventHelpers, defaults],
  init: ->
    unless @isInit
      @reset()

      Keyboard.init()

      @_initViewport()

      @viewport.$element = $('<div id="viewport" />')
        .css('width', @viewport.width.pixels)
        .css('height', @viewport.height.pixels)

      @collisionLayer = CollisionLayer.init(this)
      #@viewport.$element.append(@collisionLayer.$debugMask)

      @canvas = Canvas.create(
        @viewport.width.pixels,
        @viewport.height.pixels
      )
      @viewport.$element.append(@canvas.$element)
      #@collisionLayer.$debugMask.append(@canvas.$element)

      @_preloadMap()

      @player = new Player(this)
      @entities.push(@player)

      @isInit = true
    return this

  destroy: ->
    if @isInit
      @removeEvents()
      @detach()
      Keyboard.destroy()
      @stopDrawing()
      @reset()
      @isInit = false
    return this

  reset: ->
    @stopDrawing()
    @data = []
    @viewport = {
      width: null
      height: null
      bounds: {x1: 0, x2: 0, y1: 0, y2: 0}
      playerPadding: @playerPadding
    }
    @map = {
      width: null
      height: null
      data: []
    }
    @bg = {
      offset: {x: 0, y: 0}
    }
    return this

  addEvents: ->
    self = this
    Keyboard.addEvents()
    @_assignKeyHandlers()
    @bindEvents window,
      blur: -> self.suspend()
      focus: -> self.resume()
    return this

  removeEvents: ->
    Keyboard.removeEvents()
    @unbindEvents window, 'blur', 'focus'
    return this

  attachTo: (wrapper) ->
    $(wrapper).append(@viewport.$element)
    return this

  detach: ->
    @canvas.$element.detach()
    return this

  ready: (callback) ->
    timer = setInterval =>
      console.log "Checking to see if all grobs are loaded..."
      if (
        @mapLoaded and
        @collisionLayer.isLoaded and
        $.v.every @entities, (entity) -> entity.isLoaded
      )
        clearInterval(timer)
        callback()
    , 100

  run: ->
    @globalCounter = 0
    @_renderMap()
    @_initViewportBounds()
    @player.initOnMap()

    if @debug
      @_debugViewport()
      @player.debug()

    @startDrawing()

  startDrawing: ->
    self = this
    @drawTimer = setInterval (-> self.draw()), @drawInterval unless @drawTimer
    return this

  stopDrawing: ->
    clearInterval @drawTimer if @drawTimer
    return this

  draw: ->
    # Respond to keystrokes executed during the "dead time", i.e., the time
    # between the end of the last iteration and the start of this iteration
    Keyboard.runHandlers()

    # Reposition the background
    positionStr = [-@viewport.bounds.x1 + 'px', -@viewport.bounds.y1 + 'px'].join(" ")
    @viewport.$element.css('background-position', positionStr)
    #@collisionLayer.$debugMask.css('background-position', positionStr)

    # Clear the canvas
    @canvas.ctx.clearRect(0, 0, @viewport.width.pixels, @viewport.height.pixels)

    # Draw the player
    @player.draw()

    #increment the global counter
    @globalCounter++
    @globalCounter %= 10

  suspend: ->
    unless @stateBeforeSuspend
      @stateBeforeSuspend = {wasDrawing: !!@drawTimer}
      @stopDrawing()

  resume: ->
    if @stateBeforeSuspend
      @startDrawing() if @stateBeforeSuspend.wasDrawing
      @stateBeforeSuspend = null

  _assignKeyHandlers: ->
    self = this

    if @debug
      Keyboard.addKeyHandler ->
        self._debugViewport()
        self.player.debug()

    Keyboard.addKeyHandler 'KEY_A', 'KEY_LEFT',  'KEY_H', -> self.player.moveLeft()
    Keyboard.addKeyHandler 'KEY_D', 'KEY_RIGHT', 'KEY_L', -> self.player.moveRight()
    Keyboard.addKeyHandler 'KEY_W', 'KEY_UP',    'KEY_K', -> self.player.moveUp()
    Keyboard.addKeyHandler 'KEY_S', 'KEY_DOWN',  'KEY_J', -> self.player.moveDown()

  _initViewport: ->
    @viewport.width = @viewportWidth
    @viewport.height = @viewportHeight

  _preloadMap: ->
    # ... fetch the map data here ...
    @map.width = @mapWidth
    @map.height = @mapHeight
    @mapLoaded = true

  _renderMap: ->
    @viewport.$element.css('background-image', "url(#{@imagesPath}/map2x.png)")
    @viewport.$element.css('background-repeat', 'no-repeat')

  _initViewportBounds: ->
    @viewport.bounds.x1 = 0
    @viewport.bounds.x2 = @viewport.width.pixels
    @viewport.bounds.y1 = 0
    @viewport.bounds.y2 = @viewport.height.pixels

  _debugViewport: ->
    console.log "@viewport.bounds = (#{@viewport.bounds.x1}..#{@viewport.bounds.x2}, #{@viewport.bounds.y1}..#{@viewport.bounds.y2})"
