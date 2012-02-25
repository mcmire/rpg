(game = @game).define 'Image', (name) ->
  Image = @meta.def name,
    @roles.assignable,
    @roles.simpleDrawable,

    init: (path, @width, @height) ->
      @path = path
      unless /\.[^.]+$/.test(@path)
        @path += ".gif"
      unless /^\//.test(@path)
        @path = game.main.resolveImagePath(@path)
      @isLoaded = false

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
      @element.onerror = -> raise new Error "Could not load image #{self.path}!"

    onLoad: (fn) ->
      @onLoadCallback = fn

    clear: (ctx, x, y) ->
      ctx.clearRect(x, y, @width, @height)

    draw: (ctx, x, y) ->
      ctx.drawImage(@element, x, y)

  return Image
