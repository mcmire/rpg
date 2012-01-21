define (require) ->
  {module} = require('app/meta')
  plug = require('app/plug')
  fpsReporter = require('app/fps_reporter')
  Bounds = require('app/bounds')
  canvas = require('app/canvas')

  viewport = module 'game.viewport',
    # GETTING AN INFINITE LOOP WHEN THIS IS INCLUDED
    plug('fpsReporter'),

    width: 600   # pixels
    height: 400  # pixels
    playerPadding: 30  # pixels

    init: (@main) ->
      @bounds = Bounds.rect(0, 0, @width, @height)

      @$element = $('<div id="viewport" />').css
        width: @width
        height: @height
        'background-image': "url(#{main.imagesPath}/map2x.png)"
        'background-repeat': 'no-repeat'
      @canvas = canvas.create(@width, @height)
      @canvas.element.id = 'canvas'
      @$element.append(@canvas.$element)

    draw: ->
      bom = @bounds
      positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ")
      @$element.css('background-position', positionStr)

    # Public: Move the bounds of the viewport.
    #
    # Signatures:
    #
    # translate(axis, amount)
    #
    #   axis   - A String: 'x' or 'y'.
    #   amount - An integer by which to move the bounds in the axis.
    #
    # translate(obj)
    #
    #   obj - Object:
    #         x - An integer by which to move x1 and x2 (optional).
    #         y - An integer by which to move y1 and y2 (optional).
    #
    # Examples:
    #
    #   translateBounds('x', 20)
    #   translateBounds(x: 2, y: -9)
    #
    # Returns the self-same Viewport.
    #
    # Also see Bounds#translate.
    #
    translate: (args...) ->
      @bounds.translate(args...)
      return this

    # Public: Move the X- or Y- bounds of the viewport by specifying the position
    # of one side.
    #
    # side  - A String name of the side of the bounds: 'x1', 'x2', 'y1', or 'y2'.
    # value - An integer. The `side` is set to the `value`, and the corresponding
    #         sides are moved accordingly.
    #
    # Returns the integer distance the bounds were moved.
    #
    # Also see Bounds#translateBySide.
    #
    translateBySide: (side, value) ->
      @bounds.translateBySide(side, value)

    inspect: ->
      JSON.stringify
        "bounds": @bounds.inspect()

    debug: ->
      console.log "viewport.frame.bounds = (#{@frame.bounds.x1}..#{@frame.bounds.x2}, #{@frame.bounds.y1}..#{@frame.bounds.y2})"
      console.log "viewport.padding.bounds = (#{@padding.bounds.x1}..#{@padding.bounds.x2}, #{@padding.bounds.y1}..#{@padding.bounds.y2})"

  return viewport
