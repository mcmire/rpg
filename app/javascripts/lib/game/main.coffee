game = window.game
{keyboard, EventHelpers, viewport, collisionLayer, FpsReporter, Player} = game

main = game.util.module "game.main", EventHelpers

main.frameRate = 30  # fps
main.tileSize = 64   # pixels
main.imagesPath = '/images'
# main.animMethod = 'setTimeout'
main.animMethod = 'requestAnimFrame'

main.entities = []
main.debug = true
main.numDraws = 0
main.lastDrawTime = null
main.numTicks = 0

main.tickInterval = 1000 / main.frameRate

main.init = ->
  unless @isInit
    @reset()

    keyboard.init()

    # init map
    @map = {
      width:  @dim(2560, 'pixels')
      height: @dim(1600, 'pixels')
    }

    @viewport = viewport.init(this)
    @fpsReporter = FpsReporter.init(this)
    @collisionLayer = collisionLayer.init(this)

    @player = new Player(this, 'link2x.gif', 34, 48)
    @entities.push(@player)

    @isInit = true
  return this

main.destroy = ->
  if @isInit
    @removeEvents()
    @detach()
    keyboard.destroy()
    viewport.destroy()
    @fpsReporter.destroy()
    @collisionLayer.destroy()
    @stopTicking()
    @stopLogging()
    @reset()
    @isInit = false
  return this

main.reset = ->
  @stopTicking()
  @stopLogging()
  @logQueue = {}
  @logQueueMessages = []
  return this

main.addEvents = ->
  self = this

  keyboard.addEvents()
  @_assignKeyHandlers()
  @collisionLayer.addEvents()

  @bindEvents window,
    blur: -> self.suspend()
    focus: -> self.resume()

  return this

main.removeEvents = ->
  keyboard.removeEvents()
  @collisionLayer.removeEvents()
  @unbindEvents window, 'blur', 'focus'
  return this

main.attachTo = (element) ->
  viewport.attachTo(element)
  @fpsReporter.attachTo(viewport.$element)
  @collisionLayer.attachTo(viewport.$element)
  return this

main.detach = ->
  viewport.detach()
  @fpsReporter.detach()
  @collisionLayer.detach()
  return this

main.ready = (callback) ->
  timer = setInterval =>
    console.log "Checking to see if all entities are loaded..."
    if (
      @collisionLayer.isLoaded and
      $.v.every @entities, (entity) -> entity.isLoaded
    )
      clearInterval(timer)
      callback()
  , 100

main.suspend = ->
  unless @stateBeforeSuspend
    @stateBeforeSuspend = {wasTicking: @isTicking, wasLogging: @isLogging}
    @stopTicking()
    #@stopLogging()

main.resume = ->
  if @stateBeforeSuspend
    @startTicking() if @stateBeforeSuspend.wasTicking
    @startLogging() if @stateBeforeSuspend.wasLogging
    @stateBeforeSuspend = null

main.runWhenReady = ->
  main.ready -> main.run()
  return this

main.run = ->
  @startTicking()
  @startLogging()

main.startTicking = ->
  @isTicking = true
  @tick()
  return this

main.stopTicking = ->
  @isTicking = false
  if @tickLoopHandle
    if @animMethod is 'setTimeout'
      window.clearTimeout(@tickLoopHandle)
    else
      window.cancelRequestAnimFrame(@tickLoopHandle)
    @tickLoopHandle = null
  return this

main.tick = ->
  return if not main.isTicking

  t = (new Date()).getTime()
  main.msSinceLastDraw = if main.lastDrawTime then (t - main.lastDrawTime) else 0
  # console.log "msSinceLastDraw: #{main.msSinceLastDraw}"

  # Respond to keystrokes executed during the "dead time", i.e., the time
  # between the end of the last iteration and the start of this iteration
  keyboard.runHandlers()

  if main.animMethod is 'setTimeout'
    main.draw()
  else
    main._fpsThrottlerTimer()

  t2 = (new Date()).getTime()
  msDrawTime = t2 - t
  main.lastDrawTime = t

  # console.log "msDrawTime: #{msDrawTime}"

  if main.animMethod is 'setTimeout'
    # Ensure that ticks happen at exact regular intervals by discounting the time
    # it takes to draw (as this interval is variable)
    # main.tickLoopHandle = window.setTimeout(main.tick, main.tickInterval)
    main.tickLoopHandle = window.setTimeout(main.tick, main.tickInterval - msDrawTime)
  else
    # Try to call the tick function as fast as possible
    main.tickLoopHandle = window.requestAnimFrame(main.tick, viewport.canvas.element)

  main.numTicks++

main.draw = ->
  main.viewport.draw()
  main.player.draw()
  main.numDraws++

main.startLogging = ->
  self = this
  @isLogging = true
  @log()
  return this

main.stopLogging = ->
  @isLogging = false
  return this

main.log = ->
  return unless main.isLogging
  main._fpsReporterTimer()
  setTimeout(main.log, 1000)

main.dim = (value, unit) ->
  d = {}
  switch unit
    when "tile", "tiles"
      d.tiles = value;
      d.pixels = value * @tileSize
    when "pixel", "pixels"
      d.pixels = value;
      d.tiles = value / @tileSize
  return d

main._assignKeyHandlers = ->
  keyboard.addKeyHandler 'KEY_A', 'KEY_LEFT',  'KEY_H', -> main.player.moveLeft()
  keyboard.addKeyHandler 'KEY_D', 'KEY_RIGHT', 'KEY_L', -> main.player.moveRight()
  keyboard.addKeyHandler 'KEY_W', 'KEY_UP',    'KEY_K', -> main.player.moveUp()
  keyboard.addKeyHandler 'KEY_S', 'KEY_DOWN',  'KEY_J', -> main.player.moveDown()

main._reportingTime = (name, fn) ->
  t = (new Date()).getTime()
  fn()
  t2 = (new Date()).getTime()
  ms = t2 - t
  console.log "#{name}: #{ms} ms"

# TODO: This doesn't work quite right on Firefox (certain frames are skipped
# every once in a while)
main._createIntervalTimer = (arg, fn) ->
  if arg is true
    always = true
  else
    interval = arg
  t0 = (new Date()).getTime()
  f0 = main.numDraws
  return ->
    t = (new Date()).getTime()
    dt = t - t0
    df = main.numDraws - f0
    if always or dt >= interval
      fn(df, dt)
      t0 = (new Date()).getTime()
      f0 = main.numDraws

main._fpsThrottlerTimer = main._createIntervalTimer main.tickInterval, (df, dt) ->
  main.draw()

main._fpsReporterTimer = main._createIntervalTimer true, (df, dt) ->
  main.fpsReporter.draw(df, dt)
