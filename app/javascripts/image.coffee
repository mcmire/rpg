define (require) ->
  meta = require('app/meta2')
  {assignable, simpleDrawable} = require('app/roles')

  # Have to return a function here since main requires images which requires
  # image which requires main
  (main) ->
    Image = meta.def 'game.Image',
      assignable,
      simpleDrawable,

      init: (path, @width, @height) ->
        @path = path
        unless /\.[^.]+$/.test(@path)
          @path += ".gif"
        unless /^\//.test(@path)
          @path = main.resolveImagePath(@path)

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
        @element.onerror = -> raise new Error "Could not load image #{self.path}!"

      onLoad: (fn) ->
        @onLoadCallback = fn

      draw: (x, y) ->
        @ctx.drawImage(@element, x, y)

    return Image
