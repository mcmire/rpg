game = window.game
{Canvas} = game

game.util.module "game.FpsReporter",
  drawInterval: 1000 # ms

  init: (@main) ->
    unless @isInit
      @reset()
      @$div = $('<div id="fps-reporter" />')
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
