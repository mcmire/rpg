game = (window.game ||= {})

meta = game.meta2
{tickable} = game.roles

Map = meta.def 'game.Map',
  tickable,

  init: (@name, @width, @height, fn) ->
    bg = game.Background.create(this, @width, @height)
    fg = game.Foreground.create(this, @width, @height)
    fn(bg, fg)
    @background = bg
    @foreground = fg
    @up = @down = @left = @right = null

  load: (@core, @player) ->
    @background.load()
    @foreground.addPlayer(@player, [100, 100])
    @foreground.load()

  unload: ->
    @background.unload()
    @foreground.removePlayer(@player)
    @foreground.unload()

  frameInViewport: (viewport) ->
    @foreground.calculateAllViewportBounds(viewport)

  tick: ->
    @background.tick()
    @foreground.tick()

  connectsUpTo: (other) ->
    @up = other

  connectsDownTo: (other) ->
    @down = other

  connectsLeftTo: (other) ->
    @left = other

  connectsRightTo: (other) ->
    @right = other

game.Map = Map

window.scriptLoaded('app/map_collection')
