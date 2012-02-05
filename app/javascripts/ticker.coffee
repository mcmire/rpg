define (require) ->
  meta = require('app/meta2')
  {runnable, tickable} = require('app/roles')

  ticker = meta.def 'game.ticker',
    runnable,
    tickable,

    isRunning: false

    # override
    _includeMixin: (mixin, opts={}) ->
      opts = $.v.extend {}, opts, {start: '_start', stop: '_stop'}
      @_super mixin, opts

    destroy: ->
      @stop()

    start: ->
      return if @isRunning
      @isRunning = true
      @_start()
      return this

    _start: ->

    stop: ->
      return if not @isRunning
      @isRunning = false
      @_stop()
      return this

    _stop: ->

    suspend: ->
      @wasRunning = @isRunning
      @stop()

    resume: ->
      @start() if @wasRunning

  #---

  intervalTicker = ticker.cloneAs('game.intervalTicker').extend
    init: ->
      @drawer = @createIntervalTimer false, (df, dt) ->
        self.draw(df, dt)

    start: ->
      @timer = window.setInterval(@drawer, @tickInterval)

    stop: ->
      if @timer
        window.clearInterval(@timer)
        @timer = null

    draw: ->
      throw new Error 'draw must be overridden'

  return {
    ticker: ticker
    intervalTicker: intervalTicker
  }
