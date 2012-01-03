game = window.game

# The Bounds class represents a box, such as the box around a mob, or the box
# that keeps a mob from moving, or the frame of the viewport, or the map itself.
#
class Bounds
  # Construct a new Bounds by specifying the width and height of the bounds box
  # and (optionally) the coordinates of its top-left corner.
  #
  # width  - The integer width of the box.
  # height - The integer height of the box.
  # x1     - The integer X-coordinate of the top-left corner (default: 0).
  # y1     - The integer Y-coordinate of the top-left corner (default: 0).
  #
  # Returns a new Bounds.
  #
  @fromDims: (width, height, x1=0, y1=0) ->
    b = new Bounds()
    b.x1 = x1
    b.y1 = y1
    b.width = width
    b.height = height
    b._calculateBottomRightCorner()
    return b

  # Construct a new Bounds by specifying the coordinates of the top-left and
  # bottom-right corners of the bounds box.
  #
  # x1     - The integer X-coordinate of the top-left corner.
  # y1     - The integer Y-coordinate of the top-left corner.
  # x2     - The integer X-coordinate of the bottom-right corner.
  # y2     - The integer Y-coordinate of the bottom-right corner.
  #
  # Returns a new Bounds.
  #
  @fromCoords: (x1, y1, x2, y2) ->
    b = new Bounds()
    b.x1 = x1
    b.y1 = y1
    b.x2 = x2
    b.y2 = y2
    b._calculateWidthAndHeight()
    return b

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

  # Public: Determine whether two bounds intersect with each other.
  #
  # The intersection should be detected correctly whether these bounds are
  # taller or shorter than the given bounds. In other words, the following cases
  # are detected as intersections (1 is this, 2 is other):
  #
  #        1     2           1     2
  #             ____        ____
  #      ______|_   |   => |   _|_____
  #   => |     : |  |   => |  : |     |
  #   => |_____:_|  |   => |  :_|_____|
  #            |____|   => |____|
  #
  #     2     1            2     1
  #    ____                    ____
  #   |   _|_____        _____|_   | <=
  #   |  | :     | <=   |     | :  | <=
  #   |  |_:_____| <=   |_____|_:  | <=
  #   |____|                  |____| <=
  #
  #        |  |               |  |
  #        v  v               v  v
  #        ____             ________
  #   1   |    |        1  |  ....  |
  #      _|....|_          |_|____|_|
  #   2 | |____| |      2    |    |
  #     |________|           |____|
  #
  #       ________           ____
  #   2  |  ____  |     2   |    |
  #      |_|....|_|        _|____|_
  #   1    |    |       1 | |....| |
  #        |____|         |________|
  #         ^  ^             ^  ^
  #         |  |             |  |
  #
  # other - An instance of Bounds.
  #
  # Returns true if the Bounds intersect, otherwise false.
  #
  intersectsWith: (other) ->
    intersectsRight = (other.x1 <= @x1 <= other.x2)
    intersectsLeft  = (other.x1 <= @x2 <= other.x2)
    intersectsDown  = (other.y1 <= @y1 <= other.y2)
    intersectsUp    = (other.y1 <= @y2 <= other.y2)
    return (
      (intersectsRight or intersectsLeft) and
      (intersectsDown or intersectsUp)
    )

  # Public: Obtain the X-coordinate of the left side of these bounds which
  # blocks the given incoming bounds.
  #
  # other - An instance of Bounds.
  #
  # Returns an integer if the given Bounds intersect with these bounds,
  # otherwise returns null.
  #
  getLeftEdgeBlocking: (other) ->
    @x1 if @intersectsWith(other)

  # Public: Obtain the X-coordinate of the right side of these bounds which
  # blocks the given incoming bounds.
  #
  # other - An instance of Bounds.
  #
  # Returns an integer if the given Bounds intersect with these bounds,
  # otherwise returns null.
  #
  getRightEdgeBlocking: (other) ->
    @x2 if @intersectsWith(other)

  # Public: Obtain the Y-coordinate of the top side of these bounds which blocks
  # the given incoming bounds.
  #
  # other - An instance of Bounds.
  #
  # Returns an integer if the given Bounds intersect with these bounds,
  # otherwise returns null.
  #
  getTopEdgeBlocking: (other) ->
    @y1 if @intersectsWith(other)

  # Public: Obtain the Y-coordinate of the bottom side of these bounds which
  # blocks the given incoming bounds.
  #
  # other - An instance of Bounds.
  #
  # Returns an integer if the given Bounds intersect with these bounds,
  # otherwise returns null.
  #
  getBottomEdgeBlocking: (other) ->
    @y2 if @intersectsWith(other)

  # Public: Make a copy of the Bounds.
  #
  # Returns a new Bounds.
  #
  clone: ->
    b = new Bounds()
    for prop in 'x1 x2 y1 y2 width height'.split(' ')
      b[prop] = this[prop]
    return b

  inspect: ->
    "(#{@x1}..#{@x2}, #{@y1}..#{@y2})"

  _calculateBottomRightCorner: ->
    @x2 = @x1 + @width
    @y2 = @y1 + @height

  _calculateWidthAndHeight: ->
    @width  = @x2 - @x1
    @height = @y2 - @y1

game.Bounds = Bounds
