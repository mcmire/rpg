game = window.game

# The Bounds class represents a box, such as the box around a mob, or the box
# that keeps a mob from moving, or the frame of the viewport, or the map itself.
#
class Bounds # Construct a new Bounds.
  #
  # width  - The integer width of the bounds box.
  # height - The integer height of the bounds box.
  # x1     - The integer top-left corner of the box (default: 0).
  # y1     - The integer bottom-left corner of the box (default: 0).
  #
  constructor: (@width, @height, x1=0, y1=0) ->
    @x1 = x1 ? 0
    @x2 = x2 ? @x1 + @width
    @y1 = y1 ? 0
    @y2 = y2 ? @y1 + @height

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

  # Public: Move X- or Y-bounds by an amount by anchoring a corner.
  #
  # corner - A String name of a bound corner: 'x1', 'x2', 'y1', or 'y2'.
  # value  - An integer. The `corner` is set to the `value`, and the
  #          corresponding corner is moved proportionally.
  # Example:
  #
  #   bounds.x1 = 20
  #   bounds.x2 = 90
  #   ret = bounds.moveCorner('x1', 80)
  #   bounds.x1  #=> 80
  #   bounds.x2  #=> 150
  #   ret        #=> 60
  #
  # Returns the integer distance the bounds were moved.
  #
  moveCorner: (corner, value) ->
    # axis is the 1st character of corner, side is the 2nd
    [axis, side] = corner
    [a1, a2] = ["#{axis}1", "#{axis}2"]
    otherSide = if side is "2" then 1 else 2
    otherKey = axis + otherSide
    width = @[a2] - @[a1]
    otherValue = if side is "2" then value - width else value + width

    oldValue = @[a1]

    @[corner] = value
    @[otherKey] = otherValue

    distMoved = @[a1] - oldValue
    return distMoved

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

  # Public: Calculate the pixel amount required to correct a bounds box heading
  # in a direction toward this bounds box such that it buts against it rather
  # than intersecting it.
  #
  # This is used when moving an NPC so that it does not exit the viewport or
  # the fence that restricts it to a certain area on the map.
  #
  # direction - A String: 'up', 'down', 'left' or 'right'.
  # bounds    - The calculated next Bounds of the NPC.
  #
  # Returns a positive integer if the given Bounds would collide with these
  # Bounds, or 0 otherwise.
  #
  offsetToKeepInside: (direction, bounds) ->
    switch direction
      when 'left'
        @x1 - bounds.x1
      when 'right'
        bounds.x2 - @x2
      when 'up'
        bounds.y2 - @y2
      when 'down'
        @y1 - bounds.y1

  # Public: Make a copy of the Bounds.
  #
  # Returns a new Bounds.
  #
  clone: ->
    new Bounds(@width, @height, @x1, @y1)

  inspect: ->
    "(#{@x1}..#{@x2}, #{@y1}..#{@y2})"

game.Bounds = Bounds
