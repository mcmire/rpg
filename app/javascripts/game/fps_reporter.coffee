
define 'game.fpsReporter', ->
  meta = require('meta')
  {attachable} = require('roles')
  ticker = require('game.ticker')

  fpsReporter = ticker.clone().extend \
    attachable,

    init: (@main) ->
      self = this
      @setParentElement @main.core.viewport.getElement()
      @setElement $('<div class="fps-reporter">00.0 FPS</div>')
      @_initCheckbox()
      @$playerDebug = $('<p/>')
      @tickInterval = 1000
      @drawFn = require('game.core').createIntervalTimer false, (df, dt) -> self.draw(self, df, dt)
      @disable()
      return this

    attach: ->
      @_super()
      @main.getControlsDiv().append(@$checkbox)
      @main.getControlsDiv().append @$playerDebug

    toggle: ->
      if @isEnabled
        @disable()
      else
        @enable()

    enable: ->
      @getElement().show()
      @start()
      @isEnabled = true

    disable: ->
      @getElement().hide().removeClass('first-draw')
      @stop()
      @isEnabled = false

    start: ->
      @timer = window.setInterval(@drawFn, @tickInterval)

    stop: ->
      if @timer
        window.clearInterval(@timer)
        @timer = null

    draw: (fpsReporter, df, dt) ->
      fps = ((df / dt) * 1000).toFixed(1)
      fpsReporter.getElement().addClass('first-draw').text("#{fps} FPS")
      @$playerDebug.html @main.core.player.mbounds.inspect()

    _initCheckbox: ->
      self = this
      @$checkbox = $('
        <p class="fps-reporter">
          <label>
            <input type="checkbox" />
            Show FPS
          </label>
        </p>
      ')
      @$checkbox.on 'change', -> self.toggle()

  return fpsReporter
