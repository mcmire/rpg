(function() {
  var IntervalTicker, game, playerDebugger;

  game = (window.game || (window.game = {}));

  IntervalTicker = game.ticker.IntervalTicker;

  playerDebugger = intervalTicker.construct('game.playerDebugger', {
    init: function() {
      this._super(main);
      this.tickInterval = 1000;
      return this.$element = $('<div style="margin-top: 10px"/>');
    },
    draw: function(df, dt) {
      /*
          ticker.$div.html("""
            <b>Player on map:</b> #{ticker.main.player.bounds.onMap.inspect()}<br>
            <b>Player in viewport:</b> #{ticker.main.player.bounds.inViewport.inspect()}<br>
            <b>Viewport:</b> #{ticker.main.viewport.bounds.inspect()}
          """)
      */

      var enemy, player;
      player = this.main.player;
      enemy = this.main.enemy;
      return this.$element.html("<b>Player on map:</b> " + (player.bounds.onMap.inspect()) + "<br>\n<b>Enemy on map:</b> " + (enemy.bounds.onMap.inspect()) + "<br>\n<b>Player collides:</b> " + (player.collidables.get(2).box.intersectsWith(player.bounds.onMap) ? 'yes' : 'no'));
    }
  });

  game.playerDebugger = playerDebugger;

  window.numScriptsLoaded++;

}).call(this);
