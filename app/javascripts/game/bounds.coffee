
(game = @game).define 'Bounds', (name) ->
  _boundsFrom = (mappableOrBounds) ->
    mappableOrBounds.mbounds ? mappableOrBounds

  # The Bounds class represents a box, such as the box around a mob, or the box
  # that keeps a mob from moving, or the frame of the viewport, or the map itself.
  #
  Bounds = @meta.def name,
    x1: 0
    x2: 0
    y1: 0
    y2: 0
    width: 0
    height: 0

    # Construct a new Bounds by specifying the width and height of the bounds box
    # and (optionally) the coordinates of its top-left corner.
    #
    # x1       - The integer X-coordinate of the top-left corner.
    # y1       - The integer Y-coordinate of the top-left corner.
    # width    - The integer width of the box.
    # height   - The integer height of the box.
    #
    # Returns a new Bounds.
    #
    rect: (x1, y1, width, height) ->
      bounds = @clone()
      bounds.x1 = x1
      bounds.y1 = y1
      bounds.width = width
      bounds.height = height
      bounds._calculateBottomRightCorner()
      return bounds

    # Construct a new Bounds by specifying the coordinates of the top-left and
    # bottom-right corners of the bounds box.
    #
    # x1       - The integer X-coordinate of the top-left corner.
    # y1       - The integer Y-coordinate of the top-left corner.
    # x2       - The integer X-coordinate of the bottom-right corner.
    # y2       - The integer Y-coordinate of the bottom-right corner.
    #
    # Returns a new Bounds.
    #
    at: (x1, y1, x2, y2) ->
      bounds = @clone()
      bounds.x1 = x1
      bounds.y1 = y1
      bounds.x2 = x2
      bounds.y2 = y2
      bounds._calculateWidthAndHeight()
      return bounds

    # Public: Make a copy of these Bounds moved by an amount.
    #
    # Signatures:
    #
    # withTranslation(x: x, y: y)
    # withTranslation(x, y)
    #
    # x - Shift the x1 and x2 coords by this number.
    # y - Shift the y1 and y2 coords by this number.
    #
    # Returns a new Bounds.
    #
    withTranslation: (args...) ->
      if args.length is 1 and $.is.obj(args[0])
        {x, y} = args[0]
      else
        [x, y] = args
      bounds = @clone()
      if x?
        bounds.x1 += x
        bounds.x2 += x
      if y?
        bounds.y1 += y
        bounds.y2 += y
      return bounds

    # Public: Make a copy of these Bounds scaled down by the given amount. The
    # width and height will be recalculated appropriately.
    #
    # amount - An integer.
    #
    # Returns a new Bounds.
    #
    withScale: (amount) ->
      bounds = @clone()
      bounds.x1 = @x1 + amount
      bounds.x2 = @x2 - amount
      bounds.y1 = @y1 + amount
      bounds.y2 = @y2 - amount
      bounds.width = @width - (amount * 2)
      bounds.height = @height - (amount * 2)
      return bounds

    # Public: Destructively move the bounds.
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
    #   axis = 'x'
    #   translate(axis, 3)
    #
    #   translate(x: 4, y: 3)
    #
    # Returns the self-same Bounds.
    #
    translate: (args...) ->
      if args.length == 2
        vec = {}
        vec[args[0]] = args[1]
      else
        vec = args[0]

      if vec.x?
        @x1 += vec.x
        @x2 += vec.x
      if vec.y?
        @y1 += vec.y
        @y2 += vec.y

      return this

    # Public: Move X- or Y-bounds by specifying the position of one side.
    #
    # side  - A String name of the side of the bounds: 'x1', 'x2', 'y1', or 'y2'.
    # value - An integer. The `side` is set to the `value`, and the corresponding
    #         sides are moved accordingly.
    #
    # Example:
    #
    #   bounds.x1 = 20
    #   bounds.x2 = 90
    #   ret = bounds.translateBySide('x1', 80)
    #   bounds.x1  #=> 80
    #   bounds.x2  #=> 150
    #   ret        #=> 60
    #
    # Returns the integer distance the bounds were moved.
    #
    translateBySide: (side, value) ->
      [axis, si] = side
      si_ = if si is "2" then 1 else 2
      otherSide = axis + si_
      oldValue = @[side]
      diff = value - oldValue
      @[side] = value
      @[otherSide] += diff
      return diff

    # Public: Move the top-left corner of the box to another location, shifting
    # the other corners proportionally.
    #
    # x1 - An integer coordinate.
    # y1 - An integer coordinate.
    #
    # Returns the self-same Bounds.
    #
    anchor: (x1, y1) ->
      @x1 = x1
      @x2 = x1 + @width
      @y1 = y1
      @y2 = y1 + @height
      return this

    # Public: Like #anchor, except return a copy.
    #
    # x1 - An integer coordinate.
    # y1 - An integer coordinate.
    #
    # Returns a new Bounds.
    #
    withAnchor: (x1, y1) ->
      @clone().anchor(x1, y1)

    replace: (bounds) ->
      @width = bounds.width
      @height = bounds.height
      @x1 = bounds.x1
      @x2 = bounds.x2
      @y1 = bounds.y1
      @y2 = bounds.y2
      return this

    # Public: Determine whether two bounds intersect with each other.
    #
    # The intersection should be detected correctly whether these bounds are
    # taller or shorter than the given bounds.
    #
    # other - An instance of Bounds, or an object that includes Mappable.
    #
    # Returns true if the Bounds intersect, otherwise false.
    #
    # May also be called as #intersectsWith.
    #
    intersectWith: (other) ->
      # I intersect you...
      other = _boundsFrom(other)
      # ...if my x1 is in between your X's
      x1i = (other.x1 < @x1 < other.x2)
      # ...or my x2 is in between your X's
      x2i = (other.x1 < @x2 < other.x2)
      # ... or I am covering you, X-wise
      # [ this needs to include == or else it won't work ]
      xo  = (@x1 <= other.x1 and @x2 >= other.x2)
      # ... and ...
      # ... if my y1 is in between your Y's
      y1i = (other.y1 < @y1 < other.y2)
      # ... or my y2 is in between your Y's
      y2i = (other.y1 < @y2 < other.y2)
      # ... or I am covering you, Y-wise
      # [ this needs to include == or else it won't work ]
      yo  = (@y1 <= other.y1 and @y2 >= other.y2)
      return (
        (x1i or x2i or xo) and
        (y1i or y2i or yo)
      )

    # Public: Obtain the X-coordinate of the left side of these bounds which
    # intersects with the given incoming bounds (which are moving right).
    #
    # The intersection should be detected correctly whether these bounds are
    # taller or shorter than the given bounds. In other words, the following case
    # is detected as an intersection (1 is this, 2 is other):
    #
    #        1     2           1     2
    #             ____        ____
    #      ______|_   |   => |   _|_____
    #   => |     : |  |   => |  : |     |
    #   => |_____:_|  |   => |  :_|_____|
    #            |____|   => |____|
    #
    # other - An instance of Bounds, or an object that includes Mappable.
    #
    # Returns an integer if the given Bounds intersect with these bounds,
    # otherwise returns null.
    #
    getOuterLeftEdgeBlocking: (other) ->
      other = _boundsFrom(other)
      @x1 if @intersectsWith(other)

    # Public: Obtain the X-coordinate of the right side of these bounds which
    # intersects with the given incoming bounds (which are moving left).
    #
    # The intersection should be detected correctly whether these bounds are
    # taller or shorter than the given bounds. In other words, the following case
    # is detected as an intersection (1 is this, 2 is other):
    #
    #     2     1            2     1
    #    ____                    ____
    #   |   _|_____        _____|_   | <=
    #   |  | :     | <=   |     | :  | <=
    #   |  |_:_____| <=   |_____|_:  | <=
    #   |____|                  |____| <=
    #
    # other - An instance of Bounds, or an object that includes Mappable.
    #
    # Returns an integer if the given Bounds intersect with these bounds,
    # otherwise returns null.
    #
    getOuterRightEdgeBlocking: (other) ->
      other = _boundsFrom(other)
      @x2 if @intersectsWith(other)

    # Public: Obtain the Y-coordinate of the top side of these bounds which
    # intersects with the given incoming bounds (which are moving down).
    #
    # The intersection should be detected correctly whether these bounds are
    # taller or shorter than the given bounds. In other words, the following case
    # is detected as an intersection (1 is this, 2 is other):
    #
    #        |  |               |  |
    #        v  v               v  v
    #        ____             ________
    #   1   |    |        1  |  ....  |
    #      _|....|_          |_|____|_|
    #   2 | |____| |      2    |    |
    #     |________|           |____|
    #
    # other - An instance of Bounds, or an object that includes Mappable.
    #
    # Returns an integer if the given Bounds intersect with these bounds,
    # otherwise returns null.
    #
    getOuterTopEdgeBlocking: (other) ->
      other = _boundsFrom(other)
      @y1 if @intersectsWith(other)

    # Public: Obtain the Y-coordinate of the bottom side of these bounds which
    # blocks the given incoming bounds (which are moving up).
    #
    # The intersection should be detected correctly whether these bounds are
    # taller or shorter than the given bounds. In other words, the following case
    # is detected as an intersection (1 is this, 2 is other):
    #
    #       ________           ____
    #   2  |  ____  |     2   |    |
    #      |_|....|_|        _|____|_
    #   1    |    |       1 | |....| |
    #        |____|         |________|
    #         ^  ^             ^  ^
    #         |  |             |  |
    #
    # other - An instance of Bounds, or an object that includes Mappable.
    #
    # Returns an integer if the given Bounds intersect with these bounds,
    # otherwise returns null.
    #
    getOuterBottomEdgeBlocking: (other) ->
      other = _boundsFrom(other)
      @y2 if @intersectsWith(other)

    doesContain: (other) ->
      other = _boundsFrom(other)
      return (
        (other.x2 > @x1 and other.x1 < @x2) or
        (other.y2 > @y1 and other.y1 < @y2)
      )

    getInnerLeftEdgeBlocking: (other) ->
      other = _boundsFrom(other)
      @x1 if other.x1 < @x1

    getInnerRightEdgeBlocking: (other) ->
      other = _boundsFrom(other)
      @x2 if other.x2 > @x2

    getInnerTopEdgeBlocking: (other) ->
      other = _boundsFrom(other)
      @y1 if other.y1 < @y1

    getInnerBottomEdgeBlocking: (other) ->
      other = _boundsFrom(other)
      @y2 if other.y2 > @y2

    draw: (main) ->
      ctx = main.viewport.canvas.ctx
      ctx.strokeRect(@x1-0.5, @y1-0.5, @width, @height)

    inspect: ->
      "(#{@x1},#{@y1}) to (#{@x2},#{@y2}), #{@width}x#{@height}"

    _calculateBottomRightCorner: ->
      @x2 = @x1 + @width
      @y2 = @y1 + @height

    _calculateWidthAndHeight: ->
      @width  = @x2 - @x1
      @height = @y2 - @y1

  Bounds.intersectsWith = Bounds.intersectWith

  return Bounds
