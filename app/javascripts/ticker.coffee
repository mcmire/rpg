define (require) ->
  meta = {module} = require('app/meta')
  {runnable, tickable} = require('app/roles')

  ticker =
    construct: (args...) ->
      [overrides, name] = args.reverse()
      overrides ||= {}
      name ||= 'game.ticker'
      module name, runnable, tickable,
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
      meta.extend methods, overrides
      ticker.construct name, methods

  return \
    ticker: ticker
    intervalTicker: intervalTicker
