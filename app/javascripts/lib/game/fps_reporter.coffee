game = window.game
{Canvas} = game

game.util.module "game.FpsReporter",
  drawInterval: 1000 # ms

  init: (@main) ->
    unless @isInit
      @reset()
      #@canvas = Canvas.create(100, 40)
      @$div = $('<div />').css(
        width: '85px'
        height: '40px'
        'line-height': '40px'
        'text-align': 'center'
        'background-color': 'white'
        position: 'absolute'
        right: 0
        bottom: 0
      )
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
    # c = canvas.ctx
    # x1 = canvas.width - @canvas.width
    # y1 = canvas.height - @canvas.height
    # c.save()
    # c.fillStyle = '#ffffff'
    # c.fillRect(x1, y1, x1 + @canvas.width, y1 + @canvas.height)
    # c.fillStyle = '#ff0000'
    # c.font = '20px sans-serif'
    # c.textBaseline = 'top'
    # c.fillText("#{fps} FPS", x1+7, y1+10)
    # c.restore()
