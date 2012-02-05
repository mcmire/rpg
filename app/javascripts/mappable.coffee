define (require) ->
  meta = require('app/meta2')

  Mappable = meta.def 'game.Mappable',
    init: ->
      @_initBounds()
      @_initLastBounds()

    setPositionOnMap: (x, y) ->
      @bounds.onMap.anchor(x, y)
      @_recalculateViewportBounds()

    # Public: Move the viewport and map bounds of the player.
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
      @bounds.inViewport.translate(args...)
      @bounds.onMap.translate(args...)

    # Public: Move the X- or Y- bounds of the player by specifying the position
    # of one side of the map bounds. The viewport bounds will be moved
    # accordingly.
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
      axis = side[0]
      distMoved = @bounds.onMap.translateBySide(side, value)
      @bounds.inViewport.translate(axis, distMoved)
      return distMoved

    inspect: ->
      JSON.stringify
        "bounds.inViewport": @bounds.inViewport.inspect(),
        "bounds.onMap": @bounds.onMap.inspect()

    debug: ->
      console.log "bounds.inViewport = #{@bounds.inViewport.inspect()}"
      console.log "bounds.OnMap = #{@bounds.onMap.inspect()}"

    _initBounds: ->
      @bounds = {}
      @_initBoundsOnMap()
      @_initBoundsInViewport()

    _initLastBounds: ->
      @lastBounds = {}
      @lastBounds.onMap = @bounds.onMap
      @lastBounds.inViewport = @bounds.inViewport

    _initBoundsOnMap: ->
      @bounds.onMap = Bounds.rect(0, 0, @width, @height)

    _initBoundsInViewport: ->
      @bounds.inViewport = Bounds.rect(0, 0, @width, @height)
      @_recalculateViewportBounds()

    _recalculateViewportBounds: ->
      # XXX: This won't work for MapTile or MapSprite because we need access to
      # viewport...
      x1 = @bounds.onMap.x1 - @viewport.bounds.x1
      y1 = @bounds.onMap.y1 - @viewport.bounds.y1
      @bounds.inViewport.anchor(x1, y1)
