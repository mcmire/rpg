g = window.game ||= {}

playerDebugger =
  init: (main) ->
    ticker = new g.IntervalTicker(main)
    ticker.methods
      init: ->
        @_super(main)
        @tickInterval = 1000
        @$element = $('<div style="margin-top: 10px"/>')

      tick: ->
        ###
        ticker.$div.html("""
          <b>Player on map:</b> #{ticker.main.player.bounds.onMap.inspect()}<br>
          <b>Player in viewport:</b> #{ticker.main.player.bounds.inViewport.inspect()}<br>
          <b>Viewport:</b> #{ticker.main.viewport.bounds.inspect()}
        """)
        ###
        player = @main.player
        enemy = @main.enemy
        @$div.html("""
          <b>Player on map:</b> #{player.bounds.onMap.inspect()}<br>
          <b>Enemy on map:</b> #{enemy.bounds.onMap.inspect()}<br>
          <b>Player collides:</b> #{if player.collidables.get(2).box.intersectsWith(player.bounds.onMap) then 'yes' else 'no'}
        """)

g.playerDebugger = playerDebugger
