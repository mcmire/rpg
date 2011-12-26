game = window.game

# The Bounds class represents a box, such as the box around a mob, or the box
# that keeps a mob from moving, or the frame of the viewport, or the map itself.
#
class game.Bounds
  # Construct a new Bounds.
  #
  # width  - The integer width of the bounds box.
  # height - The integer height of the bounds box.
  # opts   - An object (default: {}):
  #          x1 - The integer top-left corner of the box (default: 0).
  #          x2 - The integer top-right corner of the box (default: width).
  #          y1 - The integer bottom-left corner of the box (default: 0).
  #          y2 - The integer bottom-right corner of the box (default: height).
  #
  constructor: (@width, @height, opts={}) ->
    {@x1, @x2, @y1, @y2} = opts

  # Public: Make a copy of these Bounds shifted by a positive amount.
  #
  # vec - Object:
  #       x (optional) - Shift the x1 and x2 coords by this number.
  #       y (optional) - Shift the y1 and y2 coords by this number.
  #
  # Returns a new Bounds.
  #
  add: (vec) ->
    bounds = @clone()
    if vec.x?
      bounds.x1 += vec.x
      bounds.x2 += vec.x
    if vec.y?
      bounds.y1 += vec.y
      bounds.y2 += vec.y
    bounds

  # Public: Make a copy of these Bounds shifted by a negative amount.
  #
  # vec - Object:
  #       x (optional) - Shift the x1 and x2 coords by this number.
  #       y (optional) - Shift the y1 and y2 coords by this number.
  #
  # Returns a new Bounds.
  #
  subtract: (vec) ->
    bounds = @clone()
    if vec.x?
      bounds.x1 -= vec.x
      bounds.x2 -= vec.x
    if vec.y?
      bounds.y1 -= vec.y
      bounds.y2 -= vec.y
    bounds

  # Public: Destructively shift the bounds.
  #
  # Signatures:
  #
  # shift(axis, amount)
  #
  #   axis - 'x' or 'y'
  #   amount - a number
  #
  # shift(obj)
  #
  #   obj - Object:
  #         x (optional): Shift x1 and y2 by this number.
  #         y (optional): Shift y1 and y2 by this number.
  #
  # Examples:
  #
  #   shift('x', 3)
  #   shift(x: 4, y: 3)
  #
  # Returns nothing.
  #
  shift: (args...) ->
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

  # Public: Move X- or Y-bounds by an amount by anchoring a corner.
  #
  # corner - A String name of a bound corner. Possible values are 'x1', 'x2',
  #          'y1', or 'y2'.
  # value  - An integer. The `corner` is set to the `value`, and the
  #          corresponding corner is moved proportionally.
  # Example:
  #
  #   bounds.x1 = 20
  #   bounds.x2 = 90
  #   ret = bounds.moveTo('x1', 80)
  #   bounds.x1  #=> 80
  #   bounds.x2  #=> 150
  #   ret        #=> 60
  #
  # Returns the distance the bounds were moved.
  #
  moveTo: (key, val) ->
    # picking characters from the string, that's all we're doing
    [axis, side] = key
    [a1, a2] = ["#{axis}1", "#{axis}2"]
    otherSide = if side is "2" then 1 else 2
    otherKey = axis + otherSide
    width = @[a2] - @[a1]
    otherVal = if side is "2" then val - width else val + width

    old = @[a1]

    @[key] = val
    @[otherKey] = otherVal

    distMoved = @[a1] - old
    return distMoved

  # Public: Make a copy of the Bounds.
  #
  # Returns a new Bounds.
  #
  clone: ->
    new Bounds(@x1, @x2, @y1, @y2)

  inspect: ->
    "(#{@x1}..#{@x2}, #{@y1}..#{@y2})"
