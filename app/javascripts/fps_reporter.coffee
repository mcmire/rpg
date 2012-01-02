game = window.game

game.util.module "game.fpsReporter",
  drawInterval: 1000 # ms

  init: (@main) ->
    self = this
    unless @isInit
      @reset()
      @$div = $('<div id="fps-reporter" />')
      @drawer = @main.createIntervalTimer true, (df, dt) ->
        self.draw(df, dt)
      @isInit = true
    return this

  destroy: ->
    if @isInit
      @reset()
      @isInit = false
    return this

  reset: ->
    @numFramesSinceDraw = 0
    @timeSinceDraw = (new Date()).getTime()
    return this

  attachTo: (container) ->
    $(container).append(@$div)

  detach: ->
    @$div.detach()

  draw: (df, dt) ->
    fps = ((df / dt) * 1000).toFixed(1)
    @$div.text("#{fps} FPS")

  start: ->
    return if @isRunning
    @timer = window.setInterval(@drawer, 1000)
    @isRunning = true
    return this

  stop: ->
    return if not @isRunning
    if @timer
      window.clearInterval(@timer)
      @timer = null
    @isRunning = false
    return this

  suspend: ->
    @wasRunning = @isRunning
    @stop()

  resume: ->
    @start() if @wasRunning
