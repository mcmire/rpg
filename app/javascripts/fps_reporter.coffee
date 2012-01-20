g = window.game ||= {}

###
# can't escape from having to make a constructor
fpsReporter = ->
  _super = fpsReporter.prototype
  $.extend this,
    _init: ->
      _super._init.apply(this, arguments)
      @tickInterval = 1000
      @tickFunction = util.createIntervalTimer true, @draw
      @$div = $('<div id="fps-reporter" />')

      $(container).append(@$div)
      @main.viewport.addPlugin(this)

    _destroy: ->
      @detach()

    attach: (container) ->


    detach: ->
      @$div.detach()

    draw: (df, dt) ->
      fps = ((df / dt) * 1000).toFixed(1)
      ticker.$div.text("#{fps} FPS")
  return this

fpsReporter.prototype = IntervalTicker.prototype
###

fpsReporter = g.intervalTicker.construct 'game.fpsReporter',
  init: (main) ->
    @_super(main)
    draw = @draw
    @tickInterval = 1000
    @tickFunction = g.main.createIntervalTimer true, (df, dt) ->
      draw(df, dt)
    @$element = $('<div id="fps-reporter" />')

  draw: (df, dt) ->
    fps = ((df / dt) * 1000).toFixed(1)
    ticker.$div.text("#{fps} FPS")

g.fpsReporter = fpsReporter
