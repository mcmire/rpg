define (require) ->
  Sprite = require('app/sprite')
  {tickable} = require('app/roles')

  spriteCollection = (->
    sc =
      sprites: {}
      add: (name, width, height, numFrames) ->
        sprite = Sprite.create
          name: name
          width: width
          height: height
          numFrames: numFrames
          doesRepeat: true
        @sprites[name] = sprite
      get: (name) ->
        @sprites[name]

    # the 0th sprite is 8x8 and has 2 frames
    sc.add 'flowers', 16, 16, 2
    # the 1st sprite is 16x16 and has 2 frames
    # sc.add 'small_wave', 16, 16, 2
    # ....

    return sc
  )()

  #---

  Map = meta.def 'game.Map',
    tickable,

    init: (@name, @width, @height, fn) ->
      @bg = Background.create(width, height)
      @fg = Foreground.create(width, height)
      fn?(@bg, @fg)
      @url = "/images/maps/#{@name}.png"
      @bg.assignTo(this)
      @fg.assignTo(this)
      # @up = @down = @left = @right = null

    destroy: ->
      @bg.destroy()
      @fg.destroy()

    addPlayer: (player) ->
      @fg.add(player)
      # Keep a special reference to the player since we'll need to access this
      # directly
      @player = player
      # TODO: Place the player somewhere on the map

    load: ->
      # XXX: Presumably this will do something?

    tick: ->
      @bg.tick()
      @fg.tick()

  #---

  MapGroup =
    create: (groupWidth, groupHeight, fn) ->
      maps = {}
      r = []
      rows = [r]

      group =
        add: (name, width, height, fn2) ->
          if r.length is groupWidth
            r = []
            rows.push(r)
          map = Map.create(name, width, height, fn2)
          r.push(map)
          ci = r.length-1
          ri = rows.length-1
          if lc = r[ci-1]
            map.connectsLeftTo(lc)
            pc.connectsRightTo(map)
          if rc = r[ci+1]
            map.connectsRightTo(jc)
            nc.connectsLeftTo(map)
          if ur = rows[ri-1]
            map.connectsUpTo(ur[ci])
            ur[ci].connectsDownTo(map)
          if dr = rows[ri+1]
            map.connectsDownTo(dr[ci])
            dr[ci].connectsUpTo(map)
          map[map.name] = map

      fn?(group)

      return maps

  #---

  Background = meta.def 'game.Background',
    tickable,

    init: (@width, @height) ->
      @sprites = []
      @canvas = canvas.create(@width, @height)
      element.init(this) for element in @elements

    assignTo: (@map) ->

    destroy: ->
      element.destroy() for element in @elements
      @elements = []

    addSprite: (name, x, y, frameDelay=null) ->
      sprite = spriteCollection.get(name)
      sprite.cloneWith(frameDelay: frameDelay)
      # TODO: Does this work?
      sprite.setMapPosition(x, y)
      @elements.push(sprite)

    tick: ->
      element.tick() for element in @elements

    getDataUrl: ->
      @canvas.element.toDataUrl()

  Background.add = Background.addSprite

  #---

  # TODO: What about the collision layer?????
  Foreground = meta.def 'game.Foreground',
    tickable,

    init: (@width, @height) ->
      @elements = []
      @canvas = canvas.create(width, height)
      # Remember that these can be map blocks, items or mobs such as the player,
      # NPC's or enemies
      element.init(this) for element in @elements

    assignTo: (@map) ->

    destroy: ->
      element.destroy() for element in @elements
      @elements = []

    addElement: (grob) ->
      @elements.push(element)

    tick: ->
      element.tick() for element in @elements

    getDataUrl: ->
      @canvas.element.toDataUrl()

  Foreground.add = Foreground.addElement

  #---

  return {
    Map: Map
    MapGroup: MapGroup
    # maps: maps
    Background: Background
    Foreground: Foreground
  }
