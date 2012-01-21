define (require) ->
  {intervalTicker} = require('app/ticker')

  fpsReporter = intervalTicker.construct 'game.fpsReporter',
    init: (main) ->
      @_super(main)
      draw = @draw
      @tickInterval = 1000
      @tickFunction = @main.createIntervalTimer true, (df, dt) ->
        draw(df, dt)
      @$element = $('<div id="fps-reporter" />')

    draw: (df, dt) ->
      fps = ((df / dt) * 1000).toFixed(1)
      @$element.text("#{fps} FPS")

  return fpsReporter
