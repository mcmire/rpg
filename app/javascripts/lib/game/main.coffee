{keyboard,
 EventHelpers,
 viewport,
 collisionLayer,
 FpsReporter,
 Player,
 Enemy} = game = window.game

main = game.util.module "game.main", EventHelpers

main.frameRate = 30  # fps
main.tileSize = 64   # pixels
main.imagesPath = '/images'
main.animMethod = 'setTimeout'
# main.animMethod = 'requestAnimFrame'

main.entities = []
main.debug = false # true
main.numDraws = 0
main.lastTickTime = null
main.numTicks = 0

main.tickInterval = 1000 / main.frameRate

main.init = ->
  unless @isInit
    @reset()

    @keyboard = keyboard.init()

    # init map
    @map = {
      width:  @dim(2560, 'pixels')
      height: @dim(1600, 'pixels')
    }

    @viewport = viewport.init(this)
    @fpsReporter = FpsReporter.init(this)
    @collisionLayer = collisionLayer.init(this)

    @_addMobs()

    @isInit = true
  return this

main.addEntity = (entity, addToCollisionLayer=true) ->
  @entities.push(entity)
  @collisionLayer.add(entity.bounds.onMap) if addToCollisionLayer
  entity.onAdded()

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

  if main.debug
    main.msSinceLastDraw = if main.lastTickTime then (t - main.lastTickTime) else 0
    console.log "msSinceLastDraw: #{main.msSinceLastDraw}"

  if main.animMethod is 'setTimeout'
    main.draw()
  else
    main._fpsThrottlerTimer()

  if main.debug
    t2 = (new Date()).getTime()
    msDrawTime = t2 - t
    main.lastTickTime = t
    console.log "msDrawTime: #{msDrawTime}"

  # Reset "stuck" keys every so often.
  # Pressing an arrow key in conjunction with the Command key can result in the
  # keyup event never getting fired for the arrow key, which will cause the
  # player to continue moving forever, so prevent this from happening.
  # TODO: This sometimes causes stutters
  keyboard.clearStuckKeys(t) if (main.numTicks % 100) == 0

  if main.animMethod is 'setTimeout'
    # Ensure that ticks happen at exact regular intervals by discounting the time
    # it takes to draw (as this interval is variable)
    main.tickLoopHandle = window.setTimeout(main.tick, main.tickInterval)
    # main.tickLoopHandle = window.setTimeout(main.tick, main.tickInterval - msDrawTime)
  else
    # Try to call the tick function as fast as possible
    main.tickLoopHandle = window.requestAnimFrame(main.tick, viewport.canvas.element)

  main.numTicks++

main.draw = ->
  main.viewport.draw()
  entity.tick() for entity in @entities
  main.numDraws++

main.startLogging = ->
  @logLoopHandle = window.setInterval(@_fpsReporterTimer, 1000)
  return this

main.stopLogging = ->
  if @logLoopHandle
    window.clearInterval(@logLoopHandle)
    @logLoopHandle = null
  return this

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

main._addMobs = ->
  # @player = new Player(this)
  # @addEntity(@player, false)

  @enemy = new Enemy(this)
  @addEntity(@enemy)

main._reportingTime = (name, fn) ->
  t = (new Date()).getTime()
  fn()
  t2 = (new Date()).getTime()
  ms = t2 - t
  console.log "#{name}: #{ms} ms"

# TODO: This produces an FPS which is 10 less than the desired FPS... any idea why?
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
