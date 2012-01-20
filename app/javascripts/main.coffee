g = window.game ||= {}

main = g.module 'game.main',
  g.eventable
  g.loadable
  g.tickable
  g.runnable
  g.plug(
    'keyboard',
    'viewport',
    'core',
    'collisionLayer',
    #'playerDebugger',
    'Player',
    'Enemy'
  )

  frameRate: 40  # fps
  imagesPath: '/images'
  animMethod: 'setTimeout'  # or 'requestAnimFrame'
  debug: false  # or true

  map:
    width:  2560  # pixels
    height: 1600  # pixels

  init: ->
    @_super()
    @addEvents()
    @attachTo(document.body)
    @run()

  addEvents: ->
    @_super()
    @bindEvents window,
      blur:  -> self.suspend()
      focus: -> self.resume()

  removeEvents: ->
    @_super()
    @unbindEvents window, 'blur', 'focus'

  reset: ->
    @_super()
    @stop() if @isInit

  load: (callback) ->
    self = this
    i = 0
    @_super()
    ticker = window.setInterval (->
      i++
      if i is 20
        window.clearInterval(ticker)
        ticker = null
        throw new Error "Grobs haven't been loaded yet?!"
        return
      console.log "Checking to see if all grobs are loaded..."
      if @isLoaded()
        window.clearInterval(ticker)
        ticker = null
        callback()
    ), 100

  # start: ->
  #   r.start() for r in @runnables

  run: ->
    main.load -> main.start()
    return this

  # stop: ->
  #   r.stop() for r in @runnables

  # suspend: ->
  #   r.suspend() for r in @runnables

  # resume: ->
  #   r.resume() for r in @runnables

  # TODO: This produces an FPS which is 10 less than the desired FPS... any idea why?
  createIntervalTimer: (arg, fn) ->
    if arg is true
      always = true
    else
      interval = arg
    t0 = (new Date()).getTime()
    f0 = @core.numDraws
    return ->
      t = (new Date()).getTime()
      dt = t - t0
      df = @core.numDraws - f0
      if always or dt >= interval
        fn(df, dt)
        t0 = (new Date()).getTime()
        f0 = @core.numDraws

g.main = main
