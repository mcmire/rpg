game = (window.game ||= {})

{IntervalTicker} = game.ticker

playerDebugger = intervalTicker.construct 'game.playerDebugger',
  init: ->
    @_super(main)
    @tickInterval = 1000
    @$element = $('<div style="margin-top: 10px"/>')

  draw: (df, dt) ->
    ###
    ticker.$div.html("""
      <b>Player on map:</b> #{ticker.main.player.bounds.onMap.inspect()}<br>
      <b>Player in viewport:</b> #{ticker.main.player.bounds.inViewport.inspect()}<br>
      <b>Viewport:</b> #{ticker.main.viewport.bounds.inspect()}
    """)
    ###
    player = @main.player
    enemy = @main.enemy
    @$element.html("""
      <b>Player on map:</b> #{player.bounds.onMap.inspect()}<br>
      <b>Enemy on map:</b> #{enemy.bounds.onMap.inspect()}<br>
      <b>Player collides:</b> #{if player.collidables.get(2).box.intersectsWith(player.bounds.onMap) then 'yes' else 'no'}
    """)

game.playerDebugger = playerDebugger
