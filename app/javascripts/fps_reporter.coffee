game = window.game

fpsReporter = game.util.module "game.fpsReporter"

fpsReporter.drawInterval = 1000 # ms

fpsReporter.init = (@main) ->
  self = this
  unless @isInit
    @reset()
    @$div = $('<div id="fps-reporter" />')
    @drawer = @main.createIntervalTimer true, (df, dt) ->
      self.draw(df, dt)
    @isInit = true
  return this

fpsReporter.destroy = ->
  if @isInit
    @reset()
    @isInit = false
  return this

fpsReporter.reset = ->
  @numFramesSinceDraw = 0
  @timeSinceDraw = (new Date()).getTime()
  return this

fpsReporter.attachTo = (container) ->
  $(container).append(@$div)

fpsReporter.detach = ->
  @$div.detach()

fpsReporter.draw = (df, dt) ->
  fps = ((df / dt) * 1000).toFixed(1)
  @$div.text("#{fps} FPS")

fpsReporter.start = ->
  return if @isRunning
  @timer = window.setInterval(@drawer, 1000)
  @isRunning = true
  return this

fpsReporter.stop = ->
  return if not @isRunning
  if @timer
    window.clearInterval(@timer)
    @timer = null
  @isRunning = false
  return this

fpsReporter.suspend = ->
  @wasRunning = @isRunning
  @stop()

fpsReporter.resume = ->
  @start() if @wasRunning
