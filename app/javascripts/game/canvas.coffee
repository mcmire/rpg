
define 'game.canvas', ->
  class Pixel
    constructor: (@x, @y, @red, @green, @blue, @alpha) ->
    isFilled: -> (@red or @green or @blue or @alpha)
    isTransparent: -> not @isFilled()

  contextExt =
    extend: (ctx) ->
      getImageData = ctx.getImageData
      createImageData = ctx.createImageData
      $.extend ctx,
        getImageData: (x, y, width, height) ->
          imageData = getImageData.apply(this, arguments)
          imageDataExt.extend(imageData)
          imageData

        createImageData: (width, height) ->
          imageData = createImageData.apply(this, arguments)
          imageDataExt.extend(imageData)
          imageData

  imageDataExt =
    extend: (imageData) ->
      $.extend imageData,
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

  canvas =
    # XXX: Yes I admit this is rather hacked up...
    create: (args...) ->
      [height, width, id, parent] = args.reverse()

      $element = $("<canvas/>")
        .attr('width', width)
        .attr('height', height)
      $element.attr('id', id) if id

      c = {}
      c.width = width
      c.height = height
      c.$element = $element
      c.element = c.$element[0]
      # c.ctx = contextExt.extend(c.element.getContext("2d"))
      c.getContext = ->
        ctx = @element.getContext("2d")
        # contextExt.extend(ctx)
        return ctx
      c.attach = ->
        @$element.appendTo(parent)
        # for some reason we have to re-assign this *after* the element is added
        # to the DOM otherwise c.$element[0] !== c.$element[0]
        @element = @$element[0]
        return this
      c.appendTo = (parent) ->
        @$element.appendTo(parent)
        # for some reason we have to re-assign this *after* the element is added
        # to the DOM otherwise c.$element[0] !== c.$element[0]
        @element = @$element[0]
        return this

      # callback(c) if callback
      return c

  return canvas
