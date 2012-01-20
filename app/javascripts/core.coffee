g = window.game ||= {}

core =
  init: (main) ->
    ticker = new g.Ticker(main)
    ticker.methods
      init: (main) ->
        @_super(main)
        draw = @draw
        @tickInterval = 1000 / @main.frameRate
        @throttledDraw = @main.createIntervalTimer @tickInterval, (df, dt) ->
          draw(df, dt)

      reset: ->
        @_super()
        @numDraws = 0
        @lastTickTime = null
        @numTicks = 0

      start: ->
        @_super (t) -> t.tick()

      stop: ->
        @_super (t) ->
          if t.timer
            if t.main.animMethod is 'setTimeout'
              window.clearTimeout(t.timer)
            else
              window.cancelRequestAnimFrame(t.timer)
            t.timer = null

      tick: ->
        # refer to `this` as `ticker` because this is called directly as a
        # function rather than a method by setTimeout, in order to reduce
        # function calls

        t = (new Date()).getTime()

        if ticker.main.debug
          ticker.msSinceLastDraw = if ticker.lastTickTime then (t - ticker.lastTickTime) else 0
          console.log "msSinceLastDraw: #{ticker.msSinceLastDraw}"

        if ticker.main.animMethod is 'setTimeout'
          ticker.draw()
        else
          ticker.throttledDraw()

        if ticker.main.debug
          t2 = (new Date()).getTime()
          msDrawTime = t2 - t
          ticker.lastTickTime = t
          console.log "msDrawTime: #{msDrawTime}"

        # Reset "stuck" keys every so often.
        # Pressing an arrow key in conjunction with the Command key can result in the
        # keyup event never getting fired for the arrow key, which will cause the
        # player to continue moving forever, so prevent this from happening.
        # TODO: This sometimes causes stutters
        keyboard.clearStuckKeys(t) if (ticker.numTicks % 100) == 0

        if ticker.main.animMethod is 'setTimeout'
          # Ensure that ticks happen at exact regular intervals by discounting the time
          # it takes to draw (as this interval is variable)
          ticker.timer = window.setTimeout(ticker.tick, ticker.tickInterval)
          # ticker.timer = window.setTimeout(ticker.tick, ticker.tickInterval - msDrawTime)
        else
          # Try to call the tick function as fast as possible
          ticker.timer = window.requestAnimFrame(ticker.tick, viewport.canvas.element)

        ticker.numTicks++

      draw: ->
        @main.viewport.draw()
        # TODO: We should probably split these steps up again
        entity.tick() for entity in @main.entities
        @numDraws++

g.core = core
