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

  draw: (canvas) ->
    @numFramesSinceDraw++
    d = (new Date()).getTime()
    duration = d - @timeSinceDraw
    if duration >= @drawInterval
      fps = ((@numFramesSinceDraw / duration) * 1000).toFixed(1)
      @_draw(canvas, fps)
      @timeSinceDraw = (new Date()).getTime()
      @numFramesSinceDraw = 0
    return this

  _draw: (canvas, fps) ->
    @$div.text("#{fps} FPS")
