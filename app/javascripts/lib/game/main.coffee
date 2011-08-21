game = window.game
{Keyboard, Canvas} = game

defaults = {}

_dim = (value, unit) ->
  d = {}
  switch unit
    when "tile", "tiles"
      d.tiles = value;
      d.pixels = value * defaults.tileSize
    when "pixel", "pixels"
      d.pixels = value;
      d.tiles = value / defaults.tileSize
  return d

defaults.drawInterval  = 30   # ms/frame
defaults.tileSize      = 32   # pixels
defaults.playerPadding = 30   # pixels
defaults.playerSpeed   = 10   # pixels/frame

defaults.imagesPath = "images"

defaults.mapLoaded        = false
defaults.numSpritesLoaded = 0
defaults.spritesLoaded    = false

defaults.viewportWidth  = _dim(24, 'tiles')
defaults.viewportHeight = _dim(16, 'tiles')

defaults.mapWidth = _dim(1280, 'pixels')
defaults.mapHeight = _dim(800, 'pixels')

game.util.module "game.Main", [defaults],
  init: ->
    unless @isInit
      @reset()

      Keyboard.init()
      @_assignKeyHandlers()

      @_initViewport()

      @viewport.$element = $('<div id="viewport" />')
        .css('width', @viewport.width.pixels)
        .css('height', @viewport.height.pixels)

      @canvas = Canvas.create(
        @viewport.width.pixels,
        @viewport.height.pixels
      )
      @viewport.$element.append(@canvas.$element)

      @_preloadMap()
      @_preloadSprites()
      @_initPlayerWithinViewport()

      @isInit = true
    return this

  destroy: ->
    if @isInit
      @removeEvents()
      @detach()
      Keyboard.destroy()
      @stopDrawing()
      @reset()
      @isInit = false
    return this

  reset: ->
    @isDrawing = false
    @data = []
    @viewport = {
      width: null
      height: null
      bounds: {x1: 0, x2: 0, y1: 0, y2: 0}
      playerPadding: @playerPadding
    }
    @map = {
      width: null
      height: null
      data: []
    }
    @bg = {
      offset: {x: 0, y: 0}
    }
    @player = {
      viewport: {
        pos: {x: 0, y: 0}
        offset: {x: 0, y: 0}
        fenceDistance: null
      }
      map: {
        pos: {x: 0, y: 0}
        width: @mapWidth
        height: @mapHeight
      }
      speed: @playerSpeed
    }
    @sprite = {
      names: ["link"]
      instances: {}
    }
    return this

  addEvents: ->
    Keyboard.addEvents()
    return this

  removeEvents: ->
    Keyboard.removeEvents()
    return this

  attachTo: (wrapper) ->
    $(wrapper).append(@viewport.$element)
    return this

  detach: ->
    @canvas.$element.detach()
    return this

  ready: (callback) ->
    timer = setInterval =>
      if @mapLoaded and @spritesLoaded
        clearInterval(timer)
        callback()
    , 100

  run: ->
    @_renderMap()
    @_initViewportBounds()
    @_initPlayerOnMap()

    @_debugViewport()
    @_debugPlayer()

    @startDrawing()

  startDrawing: ->
    unless @isDrawing
      @isDrawing = true
      @_keepDrawing()
    return this

  stopDrawing: ->
    @isDrawing = false
    return this

  draw: ->
    # Respond to keystrokes executed during the "dead time", i.e., the time
    # between the end of the last iteration and the start of this iteration
    Keyboard.runHandlers()

    # Reposition the background
    @viewport.$element.css('background-position', [-@viewport.bounds.x1 + 'px', -@viewport.bounds.y1 + 'px'].join(" "))

    # Clear the canvas
    @canvas.ctx.clearRect(0, 0, @viewport.width.pixels, @viewport.height.pixels)

    # Draw the player
    @canvas.ctx.drawImage(@sprite.instances['link'], 0, 0, 17, 24, @player.viewport.pos.x, @player.viewport.pos.y, 17, 24)

  _keepDrawing: ->
    self = this
    @draw()
    # Use setTimeout here instead of setInterval so we can guarantee that
    # we can stop the loop, if we need to
    setTimeout (-> self._keepDrawing()), @drawInterval if @isDrawing

  _assignKeyHandlers: ->
    self = this

    Keyboard.addKeyHandler ->
      self._debugViewport()
      self._debugPlayer()

    Keyboard.addKeyHandler 'KEY_A', 'KEY_LEFT',  'KEY_H', -> self._movePlayerLeft()
    Keyboard.addKeyHandler 'KEY_D', 'KEY_RIGHT', 'KEY_L', -> self._movePlayerRight()
    Keyboard.addKeyHandler 'KEY_W', 'KEY_UP',    'KEY_K', -> self._movePlayerUp()
    Keyboard.addKeyHandler 'KEY_S', 'KEY_DOWN',  'KEY_J', -> self._movePlayerDown()

  # The idea here is that we move the player sprite left until it reaches a
  # certain point (we call it the "fence"), after which we continue the
  # appearance of movement by shifting the viewport leftward along the map. We
  # do this until we've reached the left edge of the map and can scroll no
  # longer, at which point we move the player left until it touches the left
  # edge of the map.
  #
  _movePlayerLeft: ->
    if (@viewport.bounds.x1 - @player.speed) >= 0
      if (@player.viewport.pos.x - @player.speed) >= @viewport.playerPadding
        # Move player left
        @player.viewport.pos.x -= @player.speed
        @player.viewport.offset.x -= @player.speed
      else
        # Player has hit fence: shift viewport left
        @viewport.bounds.x1 -= @player.speed
        @viewport.bounds.x2 -= @player.speed
      @player.map.pos.x -= @player.speed
    else if (@player.viewport.pos.x - @player.speed) >= 0
      # Left edge of map hit: move player left
      @player.viewport.pos.x -= @player.speed
      @player.viewport.offset.x -= @player.speed
      @player.map.pos.x -= @player.speed
    else
      # Put player at left edge of map
      @player.viewport.pos.x -= @player.viewport.pos.x
      @player.viewport.offset.x -= @player.viewport.pos.x
      @player.map.pos.x -= @player.viewport.pos.x

  # Similar to moving leftward, we move the player sprite right until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport rightward along the map. We do this until we've reached the
  # right edge of the map and can scroll no longer, at which point we move the
  # player right until it touches the right edge of the map.
  #
  _movePlayerRight: ->
    if (@viewport.bounds.x2 + @player.speed) <= @map.width.pixels
      if (@viewport.width.pixels - (@player.viewport.pos.x + @tileSize + @player.speed)) >= @viewport.playerPadding
        # Move player right
        @player.viewport.pos.x += @player.speed
        @player.viewport.offset.x += @player.speed
      else
        # Player has hit fence: shift viewport right
        @viewport.bounds.x1 += @player.speed
        @viewport.bounds.x2 += @player.speed
      @player.map.pos.x += @player.speed
    else
      dist = (@player.viewport.pos.x + @tileSize) - @viewport.width.pixels
      if (dist + @player.speed) < 0
        # Right edge of map hit: move player right
        @player.viewport.pos.x += @player.speed
        @player.viewport.offset.x += @player.speed
        @player.map.pos.x += @player.speed
      else
        # Put player at right edge of map
        @player.viewport.pos.x += -dist
        @player.viewport.offset.x += -dist
        @player.map.pos.x += -dist

  # Similar to moving leftward, we move the player sprite upward until it hits
  # the fence, after which we continue the appearance of movement by shifting
  # the viewport upward along the map. We do this until we've reached the top
  # edge of the map and can scroll no longer, at which point we move the player
  # up until it touches the top edge of the map.
  #
  _movePlayerUp: ->
    if (@viewport.bounds.y1 - @player.speed) >= 0
      if (@player.viewport.pos.y - @player.speed) >= @viewport.playerPadding
        # Move player up
        @player.viewport.pos.y -= @player.speed
        @player.viewport.offset.y -= @player.speed
      else
        # Player has hit fence: shift viewport up
        @viewport.bounds.y1 -= @player.speed
        @viewport.bounds.y2 -= @player.speed
      @player.map.pos.y -= @player.speed
    else if (@player.viewport.pos.y - @player.speed) >= 0
      # Left edge of map hit: move player up
      @player.viewport.pos.y -= @player.speed
      @player.viewport.offset.y -= @player.speed
      @player.map.pos.y -= @player.speed
    else
      # Put player at top edge of map
      @player.viewport.pos.y -= @player.viewport.pos.y
      @player.viewport.offset.y -= @player.viewport.pos.y
      @player.map.pos.y -= @player.viewport.pos.y

  # Similar to moving leftward, we move the player sprite downward until it
  # hits the fence, after which we continue the appearance of movement by
  # shifting the viewport downard along the map. We do this until we've reached
  # the bottom edge of the map and can scroll no longer, at which point we move
  # the player down until it touches the bottom edge of the map.
  #
  _movePlayerDown: ->
    if (@viewport.bounds.y2 + @player.speed) <= @map.height.pixels
      if (@viewport.height.pixels - (@player.viewport.pos.y + @tileSize + @player.speed)) >= @viewport.playerPadding
        # Move player down
        @player.viewport.pos.y += @player.speed
        @player.viewport.offset.y += @player.speed
      else
        # Player has hit fence: shift viewport down
        @viewport.bounds.y1 += @player.speed
        @viewport.bounds.y2 += @player.speed
      @player.map.pos.y += @player.speed
    else
      dist = (@player.viewport.pos.y + @tileSize) - @viewport.height.pixels
      if (dist + @player.speed) < 0
        # Bottom edge of map hit: move player down
        @player.viewport.pos.y += @player.speed
        @player.viewport.offset.y += @player.speed
        @player.map.pos.y += @player.speed
      else
        # Put player at bottom edge of map
        @player.viewport.pos.y += -dist
        @player.viewport.offset.y += -dist
        @player.map.pos.y += -dist

  _initViewport: ->
    @viewport.width = @viewportWidth
    @viewport.height = @viewportHeight

  _preloadMap: ->
    # ... load the map tiles here ...
    @map.width = @mapWidth
    @map.height = @mapHeight
    @mapLoaded = true

  _preloadSprites: ->
    [i, len] = [0, @sprite.names.length]

    if len == 0
      @spritesLoaded = true
      return

    while i < len
      name = @sprite.names[i]
      image = new Image()
      image.src = "#{@imagesPath}/#{name}.gif"
      image.onload = =>
        @numSpritesLoaded++
        @spritesLoaded = true if @numSpritesLoaded == len
      @sprite.instances[name] = image
      i++
    # ( load map tiles here )

  _initPlayerWithinViewport: ->
    # Initialize the player's position on the map
    @player.viewport.pos.x = @viewport.width.pixels / 2
    @player.viewport.pos.y = @viewport.height.pixels / 2
    # Initialize the "fence" distance -- the distance the player can travel from
    # the center of the viewport to the edge of the viewport before it starts
    # scrolling
    @player.viewport.fenceDistance = (@viewport.width.pixels / 2) - @viewport.playerPadding

  _renderMap: ->
    @viewport.$element.css('background-image', "url(#{@imagesPath}/map.png)")
    @viewport.$element.css('background-repeat', 'no-repeat')

  _initViewportBounds: ->
    @viewport.bounds.x1 = 0
    @viewport.bounds.x2 = @viewport.width.pixels
    @viewport.bounds.y1 = 0
    @viewport.bounds.y2 = @viewport.height.pixels

  _initPlayerOnMap: ->
    @player.map.pos.x = @viewport.bounds.x1 + (@viewport.width.pixels / 2)
    @player.map.pos.y = @viewport.bounds.y1 + (@viewport.height.pixels / 2)

  _debugViewport: ->
    console.log "@viewport.bounds = (#{@viewport.bounds.x1}..#{@viewport.bounds.x2}, #{@viewport.bounds.y1}..#{@viewport.bounds.y2})"

  _debugPlayer: ->
    console.log "@player.viewport.pos = (#{@player.viewport.pos.x}, #{@player.viewport.pos.y})"
