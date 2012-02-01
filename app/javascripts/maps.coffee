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

  ###
  MapSpriteCollection = meta.def
    sprites: []

    create: (sprites) ->
      @_super(sprites: sprites)

    add: (name, x, y, frameDelay) ->
      sprite = spriteCollection.get(name)
      sprite = sprite.cloneWith(frameDelay: frameDelay) if frameDelay
      sprite.setPositionOnMap(x, y)
      @sprites.push(sprite)

    each: (fn) ->
      fn(sprite) for sprite in @sprites
  ###

  #---

  Map = meta.def 'game.Map',
    tickable,

    create: (name, width, height, fn) ->
      bg = Background.create(width, height)
      fg = Foreground.create(width, height)
      fn(bg, fg)
      @cloneWith
        name: name
        width: width
        height: height
        background: bg
        foreground: fg

    init: ->
      @url = "/images/maps/#{@name}.png"
      @bg.init(this)
      @fg.init(this)
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

    tick: ->
      @bg.tick()
      @fg.tick()

    # connectsUpTo: (other) ->
    #   @up = other

    # connectsDownTo: (other) ->
    #   @down = other

    # connectsLeftTo: (other) ->
    #   @left = other

    # connectsRightTo: (other) ->
    #   @right = other

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
          map = Map.create(name, width, height)
          fn2(map)
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

      fn(group)

      return maps

  #---

  ###
  maps =
    all: []

    add: (args...) ->
      unless args[0].isPrototypeOf(Map)
        [name, width, height, sprites] = args
        map = createMap(width, height, sprites)
      @all[map.name] = map
      return map

    addGroup: (groupWidth, groupHeight, fn) ->
      rows = []
      row = []
      group =
        add: (name, width, height, sprites) ->
          if cur.length is groupWidth
            rows.push(row)
            row = []
          row.push Map.create(name, width, height, sprites)
      fn(group)
      for r in [1..groupHeight-2]
        for c in [1..groupWidth-2]
          map = rows[r][c]
          map.connectsUpTo(rows[r-1][c])
          map.connectsDownTo(rows[r+1][c])
          map.connectsLeftTo(rows[r][c-1])
          map.connectsRightTo(rows[r][c+1])
          maps.add(map)

    connectHorizontally: (map1, map2) ->
      map1.connectsLeftTo(map2)
      map2.connectsRightTo(map1)

    connectVertically: (map1, map2) ->
      map1.connectsDownTo(map2)
      map2.connectsUpTo(map1)
  ###

  #---

  Background = meta.def \
    tickable,

    create: (width, height) ->
      @cloneWith
        width: width
        height: height
        # create this here so it won't be shared with all clones
        sprites: []
        # same reason
        canvas: canvas.create(width, height)

    init: (@map) ->
      element.init(this) for element in @elements

    destroy: ->
      element.destroy() for element in @elements
      @elements = []

    addSprite: (name, x, y, frameDelay=null) ->
      sprite = spriteCollection.get(name)
      sprite.cloneWith(frameDelay: frameDelay)
      sprite.setMapPosition(x, y)
      @elements.push(sprite)

    tick: ->
      element.tick() for element in @elements

    getDataUrl: ->
      @canvas.element.toDataUrl()

  Background.add = Background.addSprite

  #---

  # TODO: What about the collision layer?????
  Foreground = meta.def \
    tickable,

    create: (width, height) ->
      @cloneWith
        width: width
        height: height
        # create this here so it won't be shared with all clones
        grobs: []
        # same reason
        canvas: canvas.create(width, height)

    init: (map) ->
      # Remember that these can be map blocks, items or mobs such as the player,
      # NPC's or enemies
      element.init(this) for element in @elements

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
