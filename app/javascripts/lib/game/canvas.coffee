game = window.game

class Pixel
  constructor: (@x, @y, @red, @green, @blue, @alpha) ->
  isFilled: -> (@red or @green or @blue or @alpha)
  isTransparent: -> not @isFilled()

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
      i = (x + y * @width) * 4
      # cache to optimize as accessing properties is slow
      data = @data
      return {
        red:   data[i + 0]
        green: data[i + 1]
        blue:  data[i + 2]
        alpha: data[i + 3]
      }

    setPixel: (x, y, r, g, b, a=255) ->
      i = (x + (y * @width)) * 4
      @data[i + 0] = r
      @data[i + 1] = g
      @data[i + 2] = b
      @data[i + 3] = a

    each: (fn) ->
      # cache to optimize as accessing properties is slow
      data = @data
      [i, len] = [0, data.length]
      while i < len
        [r, g, b, a] = [data[i], data[i+1], data[i+2], data[i+3]]
        pi = Math.floor(i / 4)
        y = Math.floor(pi / @width)
        x = pi - (y * @width)
        pixel = new Pixel(x, y, r, g, b, a)
        fn(pixel)
        i += 4

