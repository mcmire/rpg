game = (window.game ||= {})

meta = game.meta2
ticker = game.ticker
{attachable} = game.roles

fpsReporter = ticker.cloneAs('game.fpsReporter').extend \
  attachable,

  init: (@main) ->
    self = this
    @attachTo(@main.core.viewport)
    @setElement $('<div id="fps-reporter">00.0 FPS</div>')
    @tickInterval = 1000
    @drawFn = game.core.createIntervalTimer false, (df, dt) -> self.draw(self, df, dt)
    return this

  start: ->
    @timer = window.setInterval(@drawFn, @tickInterval)

  stop: ->
    if @timer
      window.clearInterval(@timer)
      @timer = null

  draw: (fpsReporter, df, dt) ->
    fps = ((df / dt) * 1000).toFixed(1)
    fpsReporter.getElement().addClass('loaded').text("#{fps} FPS")

game.fpsReporter = fpsReporter

window.scriptLoaded('app/fps_reporter')

