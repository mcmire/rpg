game = window.game

class Ticker
  @create: (main, overrides) ->
    ticker = new this(false)
    $.extend ticker, overrides
    this.call(ticker, main)
    return ticker

  constructor: (main) ->
    if arguments[0] isnt false
      @main = main
      @_init()

  _init: ->
    # up to you

  destroy: ->
    @stop()
    @_destroy()
    return this

  _destroy: ->
    # up to you

  start: ->
    return if @isRunning
    @isRunning = true
    @_start()
    return this

  _start: ->
    # up to you

  stop: ->
    return if not @isRunning
    @isRunning = false
    @_stop()
    return this

  _stop: ->
    # up to you

  suspend: ->
    @wasRunning = @isRunning
    @stop()

  resume: ->
    @start() if @wasRunning

  tick: ->
    # up to you

class IntervalTicker extends Ticker
  _init: ->
    @tickFunction = @tick

  _start: ->
    @timer = window.setInterval(@tickFunction, @tickInterval)

  _stop: ->
    if @timer
      window.clearInterval(@timer)
      @timer = null

game.Ticker = Ticker
game.IntervalTicker = IntervalTicker
