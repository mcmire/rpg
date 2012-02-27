game = (window.game ||= {})

meta = game.meta2
{assignable, attachable, tickable} = game.roles

Map = meta.def 'game.Map',
  assignable,
  attachable,
  tickable,

  init: (@name, @width, @height, fn) ->
    fg = game.Foreground.create(this, @width, @height)
    bg = game.Background.create(this, @width, @height)
    fn(fg, bg)
    @foreground = fg
    @background = bg
    @up = @down = @left = @right = null
    @isActive = false

  setParent: (parent) ->
    @_super(parent)
    @viewport = viewport
    @foreground.setParent(viewport)
    @background.setParent(viewport)

  addPlayer: (@player) ->
    @foreground.addPlayer(player)

  load: ->
    @foreground.load()
    @background.load()

  # This could be a #destroy method, except that it implies that you'd call init
  # to remove the map completely -- as in, remove it from the map collection --
  # which I don't see a need for
  unload: ->
    @foreground.unload()
    @background.unload()

  attach: ->
    @foreground.attach()
    @background.attach()
    return this

  detach: ->
    @foreground.detach()
    @background.detach()
    return this

  activate: ->
    @isActive = true
    @foreground.activate()

  deactivate: ->
    @isActive = false
    @player.removeEvents()

  tick: ->
    if @isActive
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
