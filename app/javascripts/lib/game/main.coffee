game = window.game
{Keyboard, DOMEventHelpers, Canvas, Player} = game

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
defaults.tileSize      = 32   # pixels
defaults.playerPadding = 30   # pixels
defaults.playerSpeed   = 10   # pixels/frame

defaults.imagesPath = "/images"

defaults.mapLoaded = false
defaults.entities = []
defaults.numEntitiesLoaded = 0

defaults.mapWidth = _dim(1280, 'pixels')
defaults.mapHeight = _dim(800, 'pixels')

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

      @canvas = Canvas.create(
        @viewport.width.pixels,
        @viewport.height.pixels
      )
      @viewport.$element.append(@canvas.$element)

      @player = new Player(this)
      @entities.push(@player)

      @_preloadMap()
      @_preloadSprites()
      @player.initWithinViewport()

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
    @isDrawing = false
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
      #console.log entities: @entities, numEntitiesLoaded: @numEntitiesLoaded
      if @mapLoaded and @numEntitiesLoaded == @entities.length
        clearInterval(timer)
        callback()
    , 100

  run: ->
    @_renderMap()
    @_initViewportBounds()
    @player.initOnMap()

    if @debug
      @_debugViewport()
      @player.debug()

    @startDrawing()

  startDrawing: ->
    unless @isDrawing
      @isDrawing = true
      @_keepDrawing()
    return this

  stopDrawing: ->
    @isDrawing = false
    return this

  draw: ->
    # Respond to keystrokes executed during the "dead time", i.e., the time
    # between the end of the last iteration and the start of this iteration
    Keyboard.runHandlers()

    # Reposition the background
    @viewport.$element.css('background-position', [-@viewport.bounds.x1 + 'px', -@viewport.bounds.y1 + 'px'].join(" "))

    # Clear the canvas
    @canvas.ctx.clearRect(0, 0, @viewport.width.pixels, @viewport.height.pixels)

    # Draw the player
    @player.draw()

  _keepDrawing: ->
    self = this
    @draw()
    # Use setTimeout here instead of setInterval so we can guarantee that
    # we can stop the loop, if we need to
    setTimeout (-> self._keepDrawing()), @drawInterval if @isDrawing

  suspend: ->
    unless @stateBeforeSuspend
      @stateBeforeSuspend = {wasDrawing: !!@isDrawing}
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

  _preloadSprites: ->
    # needed anymore?

  _renderMap: ->
    @viewport.$element.css('background-image', "url(#{@imagesPath}/map.png)")
    @viewport.$element.css('background-repeat', 'no-repeat')

  _initViewportBounds: ->
    @viewport.bounds.x1 = 0
    @viewport.bounds.x2 = @viewport.width.pixels
    @viewport.bounds.y1 = 0
    @viewport.bounds.y2 = @viewport.height.pixels

  _debugViewport: ->
    console.log "@viewport.bounds = (#{@viewport.bounds.x1}..#{@viewport.bounds.x2}, #{@viewport.bounds.y1}..#{@viewport.bounds.y2})"
