game = window.game

Canvas = game.util.module "game.Canvas"
$.extend Canvas,
  create: (width, height, callback) ->
    c = {}
    c.$element = $("<canvas/>")
    c.element = c.$element[0]
    c.ctx = c.element.getContext("2d")
    $.extend(c.ctx, Canvas.Context)
    c.width = c.element.width = width
    c.height = c.element.height = height
    callback(c) if callback
    return c

  Context:
    getImageData: (x, y, width, height) ->
      imageData = @_super.call(this, x, y, width, height)
      $.extend(imageData, Canvas.ImageData)
      imageData

    createImageData: (width, height) ->
      imageData = @_super.call(this, width, height)
      $.extend(imageData, Canvas.ImageData)
      imageData

  ImageData:
    getPixel: (x, y) ->
      index = (x + y * @width) * 4
      red: @data[index + 0]
      green: @data[index + 1]
      blue: @data[index + 2]
      alpha: @data[index + 3]

    setPixel: (x, y, r, g, b, a) ->
      index = (x + y * @width) * 4
      @data[index + 0] = r
      @data[index + 1] = g
      @data[index + 2] = b
      @data[index + 3] = a
