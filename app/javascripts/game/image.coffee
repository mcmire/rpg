
define 'game.Image', ->
  meta = require('meta')
  {assignable, simpleDrawable} = require('roles')

  Image = meta.def \
    assignable,
    simpleDrawable,

    init: (@name, path, @width, @height) ->
      unless /\.[^.]+$/.test(path)
        path += ".gif"
      unless /^\//.test(path)
        path = require('common').resolveImagePath(path)
      @path = path
      @isLoaded = false

    getElement: -> @element

    load: ->
      self = this
      @element = document.createElement('img')
      # XXX: Actually we don't need this... this is only important for
      # MapTile... is MapTile an Image?
      @element.width = @width
      @element.height = @height
      # load the image asynchronously (?)
      @element.src = @path
      @element.onload = ->
        console.log "Loaded #{self.path}"
        self.onLoadCallback?()
        self.isLoaded = true
      @element.onerror = ->
        throw new Error "Could not load image #{self.path}!"

    onLoad: (fn) ->
      @onLoadCallback = fn

    clear: (ctx, x, y) ->
      ctx.clearRect(x, y, @width, @height)

    draw: (ctx, x, y) ->
      ctx.drawImage(@element, x, y)

  return Image
