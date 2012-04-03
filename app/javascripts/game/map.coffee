
define 'game.Map', ->
  meta = require('meta')
  {assignable, attachable, tickable} = require('roles')

  Map = meta.def \
    assignable,
    attachable,
    tickable,

    init: (@name, @width, @height, fn) ->
      fg = require('game.Foreground').create(this, @width, @height)
      bg = require('game.Background').create(this, @width, @height)
      fn(fg, bg)
      @foreground = fg
      @background = bg
      @up = @down = @left = @right = null
      @isActive = false

    setParent: (parent) ->
      @_super(parent)
      @viewport = parent
      @foreground.setParent(parent)
      @background.setParent(parent)

    addPlayer: (@player) ->
      @foreground.addPlayer(player)

    load: ->
      @foreground.load()
      @background.load()

    # This could be a #destroy method, except that it implies that you'd call
    # init to remove the map completely -- as in, remove it from the map
    # collection -- which I don't see a need for
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

  return Map
