define (require) ->
  meta = {module} = require('app/meta')
  {runnable, tickable} = require('app/roles')

  ticker =
    construct: (mixins...) ->
      name = mixins.shift() if typeof mixins[0] is 'string'
      name ||= 'game.ticker'
      mod = module name, runnable, tickable,
        init: (@main) ->

        destroy: ->
          @stop() if @isInit

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

      mod.addTranslations
        start: '_start'
        stop: '_stop'

      mod.extend(mixins...)

      return mod

  intervalTicker =
    construct: (mixins...) ->
      name = mixins.shift() if typeof mixins[0] is 'string'
      name ||= 'game.intervalTicker'
      mod = ticker.construct name,
        init: (main) ->
          self = this
          @_super(main)
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

      mod.extend(mixins...)

      return mod

  return {
    ticker: ticker
    intervalTicker: intervalTicker
  }
