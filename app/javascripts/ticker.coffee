g = window.game ||= {}

ticker =
  construct: (args...) ->
    [overrides, name] = args.reverse()
    overrides ||= {}
    name ||= 'game.ticker'
    g.module name, g.runnable, g.tickable,
      init: (@main) ->

      destroy: ->
        @stop() if @isInit

      start: ->
        return if @isRunning
        @isRunning = true
        overrides.start?.call(this)
        return this

      stop: ->
        return if not @isRunning
        @isRunning = false
        overrides.stop?.call(this)
        return this

      suspend: ->
        @wasRunning = @isRunning
        @stop()

      resume: ->
        @start() if @wasRunning

intervalTicker =
  construct: (args...) ->
    [overrides, name] = args.reverse()
    overrides ||= {}
    name ||= 'game.intervalTicker'
    methods =
      init: (main) ->
        @_super(main)
        @tickFunction = @tick

      start: ->
        @timer = window.setInterval(@tickFunction, @tickInterval)

      stop: ->
        if @timer
          window.clearInterval(@timer)
          @timer = null
    g.meta.extend methods, overrides
    ticker.construct name, methods

g.ticker = ticker
g.intervalTicker = intervalTicker
