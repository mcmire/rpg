(game = @game).define 'Map', (name) ->
  Map = @meta.def name,
    @roles.tickable,

    init: (@name, @width, @height, fn) ->
      fg = game.Foreground.create(this, @width, @height)
      bg = game.Background.create(this, @width, @height)
      fn(fg, bg)
      @foreground = fg
      @background = bg
      @up = @down = @left = @right = null
      @isActive = false

    assignTo: (@viewport) ->
      @foreground.assignToViewport(@viewport)
      @background.assignToViewport(@viewport)

    addPlayer: (@player) ->
      @foreground.addPlayer(player)

    load: ->
      @foreground.load()
      @background.load()

    unload: ->
      @foreground.unload()
      @background.unload()

    attachToViewport: ->
      @foreground.attachTo(@viewport)
      @background.attachTo(@viewport)
      return this

    detachFromViewport: ->
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

  return Map
