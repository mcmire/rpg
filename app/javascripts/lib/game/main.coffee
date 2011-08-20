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
      names: ["player"]
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
      console.log "Checking to see if map/sprites loaded..."
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
    @canvas.ctx.drawImage(@sprite.instances['player'], @player.viewport.pos.x, @player.viewport.pos.y)

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

    Keyboard.addKeyHandler 'KEY_A', 'KEY_LEFT', ->
      # The idea here is that we move the player sprite left until it
      # reaches a certain point (we call it the "fence"), after which we
      # continue the appearance of movement by shifting the viewport
      # leftward along the map. We do this until we've reached the left
      # edge of the map and can scroll no longer, at which point we move
      # the player left until it touches the left edge of the map.
      #
      if (self.viewport.bounds.x1 - self.player.speed) >= 0
        if (self.player.viewport.pos.x - self.player.speed) >= self.viewport.playerPadding
          # Move player left
          self.player.viewport.pos.x -= self.player.speed
          self.player.viewport.offset.x -= self.player.speed
        else
          # Player has hit fence: shift viewport left
          self.viewport.bounds.x1 -= self.player.speed
          self.viewport.bounds.x2 -= self.player.speed
        self.player.map.pos.x -= self.player.speed
      else if (self.player.viewport.pos.x - self.player.speed) >= 0
        # Left edge of map hit: move player left
        self.player.viewport.pos.x -= self.player.speed
        self.player.viewport.offset.x -= self.player.speed
        self.player.map.pos.x -= self.player.speed
      else
        # Put player at left edge of map
        self.player.viewport.pos.x -= self.player.viewport.pos.x
        self.player.viewport.offset.x -= self.player.viewport.pos.x
        self.player.map.pos.x -= self.player.viewport.pos.x

    Keyboard.addKeyHandler 'KEY_D', 'KEY_RIGHT', ->
      # Similar to moving leftward, we move the player sprite right until
      # it hits the fence, after which we continue the appearance of
      # movement by shifting the viewport rightward along the map. We do
      # this until we've reached the right edge of the map and can scroll
      # no longer, at which point we move the player right until it touches
      # the right edge of the map.
      #
      if (self.viewport.bounds.x2 + self.player.speed) <= self.map.width.pixels
        if (self.viewport.width.pixels - (self.player.viewport.pos.x + self.tileSize + self.player.speed)) >= self.viewport.playerPadding
          # Move player right
          self.player.viewport.pos.x += self.player.speed
          self.player.viewport.offset.x += self.player.speed
        else
          # Player has hit fence: shift viewport right
          self.viewport.bounds.x1 += self.player.speed
          self.viewport.bounds.x2 += self.player.speed
        self.player.map.pos.x += self.player.speed
      else
        dist = (self.player.viewport.pos.x + self.tileSize) - self.viewport.width.pixels
        if (dist + self.player.speed) < 0
          # Right edge of map hit: move player right
          self.player.viewport.pos.x += self.player.speed
          self.player.viewport.offset.x += self.player.speed
          self.player.map.pos.x += self.player.speed
        else
          # Put player at right edge of map
          self.player.viewport.pos.x += -dist
          self.player.viewport.offset.x += -dist
          self.player.map.pos.x += -dist

    Keyboard.addKeyHandler 'KEY_W', 'KEY_UP', ->
      # Similar to moving leftward, we move the player sprite upward until
      # it hits the fence, after which we continue the appearance of
      # movement by shifting the viewport upward along the map. We do
      # this until we've reached the top edge of the map and can scroll
      # no longer, at which point we move the player up until it touches
      # the top edge of the map.
      #
      if (self.viewport.bounds.y1 - self.player.speed) >= 0
        if (self.player.viewport.pos.y - self.player.speed) >= self.viewport.playerPadding
          # Move player up
          self.player.viewport.pos.y -= self.player.speed
          self.player.viewport.offset.y -= self.player.speed
        else
          # Player has hit fence: shift viewport up
          self.viewport.bounds.y1 -= self.player.speed
          self.viewport.bounds.y2 -= self.player.speed
        self.player.map.pos.y -= self.player.speed
      else if (self.player.viewport.pos.y - self.player.speed) >= 0
        # Left edge of map hit: move player up
        self.player.viewport.pos.y -= self.player.speed
        self.player.viewport.offset.y -= self.player.speed
        self.player.map.pos.y -= self.player.speed
      else
        # Put player at top edge of map
        self.player.viewport.pos.y -= self.player.viewport.pos.y
        self.player.viewport.offset.y -= self.player.viewport.pos.y
        self.player.map.pos.y -= self.player.viewport.pos.y

    Keyboard.addKeyHandler 'KEY_S', 'KEY_DOWN', ->
      # Similar to moving leftward, we move the player sprite downward
      # until it hits the fence, after which we continue the appearance of
      # movement by shifting the viewport downard along the map. We do
      # this until we've reached the bottom edge of the map and can scroll
      # no longer, at which point we move the player down until it touches
      # the bottom edge of the map.
      #
      if (self.viewport.bounds.y2 + self.player.speed) <= self.map.height.pixels
        if (self.viewport.height.pixels - (self.player.viewport.pos.y + self.tileSize + self.player.speed)) >= self.viewport.playerPadding
          # Move player down
          self.player.viewport.pos.y += self.player.speed
          self.player.viewport.offset.y += self.player.speed
        else
          # Player has hit fence: shift viewport down
          self.viewport.bounds.y1 += self.player.speed
          self.viewport.bounds.y2 += self.player.speed
        self.player.map.pos.y += self.player.speed
      else
        dist = (self.player.viewport.pos.y + self.tileSize) - self.viewport.height.pixels
        if (dist + self.player.speed) < 0
          # Bottom edge of map hit: move player down
          self.player.viewport.pos.y += self.player.speed
          self.player.viewport.offset.y += self.player.speed
          self.player.map.pos.y += self.player.speed
        else
          # Put player at bottom edge of map
          self.player.viewport.pos.y += -dist
          self.player.viewport.offset.y += -dist
          self.player.map.pos.y += -dist

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
      image = new Image(@tileSize, @tileSize)
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

  _initViewportBounds: ->
    # (just leave the viewport at (0, 0) for now)

  _initPlayerOnMap: ->
    @player.map.pos.x = @viewport.bounds.x1 + (@viewport.width.pixels / 2)
    @player.map.pos.y = @viewport.bounds.y1 + (@viewport.height.pixels / 2)

  _debugViewport: ->
    console.log "@viewport.bounds = (#{@viewport.bounds.x1}..#{@viewport.bounds.x2}, #{@viewport.bounds.y1}..#{@viewport.bounds.y2})"

  _debugPlayer: ->
    console.log "@player.viewport.pos = (#{@player.viewport.pos.x}, #{@player.viewport.pos.y})"
