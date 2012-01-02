{keyboard,
 EventHelpers,
 viewport,
 collisionLayer,
 fpsReporter,
 Player,
 Enemy} = game = window.game

ticker = {}

ticker.init = (@main) ->
  @tickInterval = 1000 / @main.frameRate
  @throttledDrawer = @main.createIntervalTimer @tickInterval, (df, dt) ->
    ticker.draw()
  return this

ticker.start = ->
  return if @isRunning
  @isRunning = true
  @tick()
  return this

ticker.stop = ->
  return if not @isRunning
  @isRunning = false
  if @timer
    if @main.animMethod is 'setTimeout'
      window.clearTimeout(@timer)
    else
      window.cancelRequestAnimFrame(@timer)
    @timer = null
  return this

ticker.suspend = ->
  @wasRunning = @isRunning
  @stop()

ticker.resume = ->
  @start() if @wasRunning

ticker.tick = ->
  return if not ticker.isRunning

  t = (new Date()).getTime()

  if ticker.main.debug
    ticker.msSinceLastDraw = if ticker.lastTickTime then (t - ticker.lastTickTime) else 0
    console.log "msSinceLastDraw: #{ticker.msSinceLastDraw}"

  if ticker.main.animMethod is 'setTimeout'
    ticker.draw()
  else
    ticker.throttledDrawer()

  if ticker.main.debug
    t2 = (new Date()).getTime()
    msDrawTime = t2 - t
    ticker.lastTickTime = t
    console.log "msDrawTime: #{msDrawTime}"

  # Reset "stuck" keys every so often.
  # Pressing an arrow key in conjunction with the Command key can result in the
  # keyup event never getting fired for the arrow key, which will cause the
  # player to continue moving forever, so prevent this from happening.
  # TODO: This sometimes causes stutters
  keyboard.clearStuckKeys(t) if (ticker.main.numTicks % 100) == 0

  if ticker.main.animMethod is 'setTimeout'
    # Ensure that ticks happen at exact regular intervals by discounting the time
    # it takes to draw (as this interval is variable)
    ticker.timer = window.setTimeout(ticker.tick, ticker.tickInterval)
    # ticker.timer = window.setTimeout(ticker.tick, ticker.tickInterval - msDrawTime)
  else
    # Try to call the tick function as fast as possible
    ticker.timer = window.requestAnimFrame(ticker.tick, viewport.canvas.element)

  ticker.main.numTicks++

ticker.draw = ->
  @main.viewport.draw()
  # TODO: We should probably split these steps up again
  entity.tick() for entity in @main.entities
  @main.numDraws++

#-------------------------------------------------------------------------------

main = game.util.module "game.main", EventHelpers

main.frameRate = 40  # fps
main.tileSize = 64   # pixels
main.imagesPath = '/images'
main.animMethod = 'setTimeout'
# main.animMethod = 'requestAnimFrame'
main.debug = false  # or true

main.timers = []
main.entities = []

main.numDraws = 0
main.lastTickTime = null
main.numTicks = 0

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
    @collisionLayer = collisionLayer.init(this)

    @_addMobs()

    # $boundsDebug = $('<div style="margin-top: 10px"/>').appendTo(document.body)
    # self = this
    # setInterval ->
    #   $boundsDebug.html("""
    #     <b>Player on map:</b> #{self.player.bounds.onMap.inspect()}<br>
    #     <b>Player in viewport:</b> #{self.player.bounds.inViewport.inspect()}<br>
    #     <b>Viewport:</b> #{self.viewport.bounds.inspect()}
    #   """)
    # , 1000

    @ticker = ticker.init(this)
    @timers.push(@ticker)

    @fpsReporter = fpsReporter.init(this)
    @timers.push(@fpsReporter)

    @isInit = true
  return this

main._addMobs = ->
  @player = new Player(this)
  @addEntity(@player, false)

  @enemy = new Enemy(this)
  @addEntity(@enemy)

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
    @stop()
    @reset()
    @isInit = false
  return this

main.reset = ->
  @stop()
  @logQueue = {}
  @logQueueMessages = []
  return this

main.addEvents = ->
  self = this

  keyboard.addEvents()
  @collisionLayer.addEvents()

  @bindEvents window,
    blur:  -> self.suspend()
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
  self = this
  i = 0
  timer = window.setInterval (->
    i++
    if i is 20
      window.clearInterval(timer)
      timer = null
      throw new Error "Entities haven't been loaded yet?!"
      return
    console.log "Checking to see if all entities are loaded..."
    if (
      self.collisionLayer.isLoaded and
      $.v.every self.entities, (entity) -> entity.isLoaded
    )
      window.clearInterval(timer)
      timer = null
      callback()
  ), 100

main.run = ->
  timer.start() for timer in @timers

main.runWhenReady = ->
  main.ready -> main.run()
  return this

main.stop = ->
  timer.stop() for timer in @timers

main.suspend = ->
  timer.suspend() for timer in @timers

main.resume = ->
  timer.resume() for timer in @timers

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

# TODO: This produces an FPS which is 10 less than the desired FPS... any idea why?
main.createIntervalTimer = (arg, fn) ->
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

main._reportingTime = (name, fn) ->
  t = (new Date()).getTime()
  fn()
  t2 = (new Date()).getTime()
  ms = t2 - t
  console.log "#{name}: #{ms} ms"
