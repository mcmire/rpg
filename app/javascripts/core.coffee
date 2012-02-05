game = (window.game ||= {})

{ticker} = game.ticker
# plug = game.plug
{attachable, tickable} = game.roles
viewport = game.viewport
# collisionLayer = game.collisionLayer
player = game.player
{maps} = game.maps

core = ticker.cloneAs('game.core')

#core.addPlugin(viewport)
# TODO: Not sure where this will go
#core.addPlugin(collisionLayer)

core.extend \
  attachable,
  tickable,

  frameRate: 40  # fps
  animMethod: 'setTimeout'  # or 'requestAnimFrame'

  init: (@main) ->
    @_super(@main)
    self = this
    @keyboard = @main.keyboard
    @viewport = viewport.init(this)
    @tickInterval = 1000 / @frameRate
    @throttledDraw = @createIntervalTimer @tickInterval, (df, dt) ->
      self.draw(df, dt)
    @numDraws = 0
    @lastTickTime = null
    @numTicks = 0
    @player = player
    return this

  setElement: ->
    @$element = @parentElement

  attach: ->
    @viewport.attach()

  start: ->
    @loadMap('lw_52')
    # calling tick() once starts the loop immediately since it calls itself
    @tick()

  stop: ->
    if @timer
      if @animMethod is 'setTimeout'
        window.clearTimeout(@timer)
      else
        window.cancelRequestAnimFrame(@timer)
      @timer = null

  tick: ->
    # refer to `this` as `core` because this is called directly as a function
    # rather than a method by setTimeout, in order to reduce function calls

    t = (new Date()).getTime()

    if core.main.debug
      core.msSinceLastDraw = if core.lastTickTime then (t - core.lastTickTime) else 0
      console.log "msSinceLastDraw: #{core.msSinceLastDraw}"

    if core.animMethod is 'setTimeout'
      core.draw()
    else
      core.throttledDraw()

    if core.main.debug
      t2 = (new Date()).getTime()
      msDrawTime = t2 - t
      core.lastTickTime = t
      console.log "msDrawTime: #{msDrawTime}"

    # Reset "stuck" keys every so often.
    # Pressing an arrow key in conjunction with the Command key can result in the
    # keyup event never getting fired for the arrow key, which will cause the
    # player to continue moving forever, so prevent this from happening.
    # TODO: This sometimes causes stutters
    core.keyboard.clearStuckKeys(t) if (core.numTicks % 100) == 0

    if core.animMethod is 'setTimeout'
      # Ensure that ticks happen at exact regular intervals by discounting the time
      # it takes to draw (as this interval is variable)
      core.timer = window.setTimeout(core.tick, core.tickInterval)
      # core.timer = window.setTimeout(core.tick, core.tickInterval - msDrawTime)
    else
      # Try to call the tick function as fast as possible
      core.timer = window.requestAnimFrame(core.tick, viewport.canvas.element)

    core.numTicks++

  draw: ->
    @viewport.tick()
    @currentMap.tick()
    @numDraws++

  # TODO: This produces an FPS which is 10 less than the desired FPS... any idea why?
  createIntervalTimer: (arg, fn) ->
    if arg is true
      always = true
    else
      interval = arg
    t0 = (new Date()).getTime()
    f0 = @numDraws
    return ->
      t = (new Date()).getTime()
      dt = t - t0
      df = @numDraws - f0
      if always or dt >= interval
        fn(df, dt)
        t0 = (new Date()).getTime()
        f0 = @numDraws

  loadMap: (name) ->
    self = this
    @currentMap.unload() if @currentMap
    @currentMap = maps['lw_52']
    @currentMap.load(this, @player)
    # TODO: Transition instead of hard setting
    @viewport.setMap(@currentMap)

game.core = core

window.scriptLoaded('app/core')
