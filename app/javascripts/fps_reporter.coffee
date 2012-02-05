game = (window.game ||= {})

{intervalTicker} = game.ticker
{attachable} = game.roles

fpsReporter = intervalTicker.construct 'game.fpsReporter', attachable,
  init: (@main) ->
    @core = @main.core
    @_super(@main)
    @tickInterval = 1000
    @$element = $('<div id="fps-reporter" />')

  draw: (df, dt) ->
    fps = ((df / dt) * 1000).toFixed(1)
    @$element.text("#{fps} FPS")

return fpsReporter

window.numScriptsLoaded++
