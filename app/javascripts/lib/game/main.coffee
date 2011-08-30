game = window.game
{
  Keyboard,
  DOMEventHelpers,
  Canvas,
  CollisionLayer,
  Viewport,
  Player,
  FpsReporter
} = game

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

defaults.drawInterval  = 90   # ms/frame
defaults.tileSize      = 64   # pixels

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

defaults.debug = true

Main = game.util.module "game.Main"
$.extend Main, DOMEventHelpers, defaults

draw = ->
  self = Main

  # Respond to keystrokes executed during the "dead time", i.e., the time
  # between the end of the last iteration and the start of this iteration
  Keyboard.runHandlers()

  # Reposition the background
  positionStr = [-self.viewport.frame.boundsOnMap.x1 + 'px', -self.viewport.frame.boundsOnMap.y1 + 'px'].join(" ")
  self.viewport.$element.css('background-position', positionStr)
  #self.collisionLayer.$debugMask.css('background-position', positionStr)

  # Clear the canvas
  # TODO: Keep track of the last position of each entity and use this to clear
  # the canvas selectively
  # self.canvas.ctx.clearRect(0, 0, self.viewport.width.pixels, self.viewport.height.pixels)

  # Draw the player
  self.player.draw(self.canvas)

  # TEST - TODO: Move this to a background image
  self.canvas.ctx.drawImage(self.collisionLayer.debugCanvas.element, 0, 0)

  # Increment the global counter
  self.globalCounter++
  self.globalCounter %= 10

  self.fpsReporter.draw(self.canvas)

  self.drawTimer = window.requestAnimFrame(draw, self.canvas.element) if self.isDrawing

$.extend Main,
  init: ->
    unless @isInit
      @reset()

      Keyboard.init()

      @viewport = Viewport.init(this)

      @viewport.$element = $('<div id="viewport" />')
        .css('width', @viewport.width.pixels)
        .css('height', @viewport.height.pixels)

      @fpsReporter = FpsReporter.init(this)

      @collisionLayer = CollisionLayer.init(this)
      #@viewport.$element.append(@collisionLayer.$debugMask)

      @canvas = Canvas.create(
        @viewport.width.pixels,
        @viewport.height.pixels
      )
      @viewport.$element.append(@canvas.$element)
      #@collisionLayer.$debugMask.append(@canvas.$element)

      @_preloadMap()

      @player = new Link(this, 'link2x.gif', width: 34, height: 48 )
      @entities.push(@player)

      @isInit = true
    return this

  destroy: ->
    if @isInit
      @removeEvents()
      @detach()
      Keyboard.destroy()
      @stopDrawing()
      @stopLogging()
      @reset()
      @isInit = false
    return this

  reset: ->
    @stopDrawing()
    @stopLogging()
    @data = []
    @map = {
      # (width: null)
      # (height: null)
      data: []
    }
    # OLD?
    @bg = {
      offset: {} # x, y
    }
    @logQueue = {}
    @logQueueMessages = []
    return this

  addEvents: ->
    self = this
    Keyboard.addEvents()
    @_assignKeyHandlers()
    @bindEvents window,
     blur: ->
       # console.log "blurrr"
       self.suspend()
     focus: ->
       # console.log "focussss"
       self.resume()
    return this

  removeEvents: ->
    Keyboard.removeEvents()
    @unbindEvents window, 'blur', 'focus'
    return this

  attachTo: (element) ->
    @fpsReporter.attachTo(@viewport.$element)
    $(element).append(@viewport.$element)
    return this

  detach: ->
    @canvas.$element.detach()
    @fpsReporter.detach()
    return this

  ready: (callback) ->
    timer = setInterval =>
      console.log "Checking to see if all entities are loaded..."
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
    @viewport.initBounds()
    @player.initBoundsOnMap()

    # if @debug
    #   @viewport.debug()
    #   @player.debug()

    @startDrawing()
    #@startLogging()

  startDrawing: ->
    # console.log "start drawing"
    @isDrawing = true
    # @drawTimer = requestInterval draw, @drawInterval if @isDrawing
    @drawTimer = window.requestAnimFrame(draw, @canvas.element) unless @drawTimer
    return this

  stopDrawing: ->
    # console.log "stop drawing"
    @isDrawing = false
    if @drawTimer
      window.cancelRequestAnimFrame(@drawTimer)
      @drawTimer = null
    return this

  # keepDrawing: ->
  #   self = this
  #   @drawTimer = requestInterval draw, @drawInterval if @isDrawing

  startLogging: ->
    self = this
    @isLogging = true
    @keepLogging()
    return this

  stopLogging: ->
    @isLogging = false
    return this

  keepLogging: ->
    self = this
    @flushLogQueue()
    setTimeout (-> self.keepLogging()), 1000 if @isLogging

  flushLogQueue: ->
    for name in @logQueueMessages
      msgs = @logQueue[name]()
      msgs = [msgs] unless $.v.is.arr(msgs)
      console.log(msg) for msg in msgs
    @logQueue = {}
    @logQueueMessages = []

  log: (name, fn) ->
    unless @logQueue.hasOwnProperty(name)
      @logQueue[name] = fn
      @logQueueMessages.push(name)

  suspend: ->
    unless @stateBeforeSuspend
      @stateBeforeSuspend = {wasDrawing: @isDrawing, wasLogging: @isLogging}
      @stopDrawing()
      #@stopLogging()

  resume: ->
    if @stateBeforeSuspend
      @startDrawing() if @stateBeforeSuspend.wasDrawing
      #@startLogging() if @stateBeforeSuspend.wasLogging
      @stateBeforeSuspend = null

  _assignKeyHandlers: ->
    self = this

    # if @debug
    #   Keyboard.addKeyHandler ->
    #     self.log "debug viewport and player on keypress", -> [
    #       "viewport: #{self.viewport.inspect()}",
    #       "player: #{self.player.inspect()}"
    #     ]

    # Keyboard.addKeyHandler ->
    #   biv = self.player.bounds.inViewport
    #   bom = self.player.bounds.onMap
    #   vbm = self.viewport.frame.boundsOnMap
    #   console.log "bounds.inViewport:         #{biv.inspect()}"
    #   console.log "bounds.onMap:              #{bom.inspect()}"
    #   console.log "viewport.bounds.onMap:     #{vbm.inspect()}"

    Keyboard.addKeyHandler 'KEY_A', 'KEY_LEFT',  'KEY_H', -> self.player.moveLeft()
    Keyboard.addKeyHandler 'KEY_D', 'KEY_RIGHT', 'KEY_L', -> self.player.moveRight()
    Keyboard.addKeyHandler 'KEY_W', 'KEY_UP',    'KEY_K', -> self.player.moveUp()
    Keyboard.addKeyHandler 'KEY_S', 'KEY_DOWN',  'KEY_J', -> self.player.moveDown()

  _preloadMap: ->
    # ... fetch the map data here ...
    @map.width = @mapWidth
    @map.height = @mapHeight
    @mapLoaded = true

  _renderMap: ->
    @viewport.$element.css('background-image', "url(#{@imagesPath}/map2x.png)")
    @viewport.$element.css('background-repeat', 'no-repeat')
