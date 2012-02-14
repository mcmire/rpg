game = (window.game ||= {})

meta = game.meta2

SortedObjectCollection = meta.def 'game.SortedObjectCollection',
  # Initialize the collection.
  #
  # map       - An instance of Foreground or Background.
  # objects   - An optional Array to populate the collection with, i.e., most
  #             likely the value of an existing collection's @object Array
  #             (default: []).
  # exception - An optional object which will be left out when the collection
  #             is iterated over (default: null).
  #
  init: (@map, args...) ->
    # @exception = args.pop()
    @objects = args[0] ? []

  # Public: Create a copy of this collection which will omit the given object
  # upon being iterated over.
  #
  # Returns a new SortedObjectCollection.
  #
  # without: (object) ->
  #   @create(@map, @objects, object)

  # Public: Add an object to the collection, keeping @objects in sorted order.
  #
  add: (object) ->
    [yi, yr] = @_findOrCreateRowIn(@objects, object.mbounds.y1)
    [xi, xr] = @_findOrCreateRowIn(yr[1], object.mbounds.x1)
    xr[1].push(object)

  # Public: Remove an object from the collection, patching holes.
  #
  remove: (object) ->
    [y, x] = [object.mbounds.y1, object.mbounds.x1]
    # TODO: Provide a way to grab y and x values directly, like say using a hash
    [yi, yr] = @_findRowIn(@objects, object.mbounds.y1)
    if yr
      [xi, xr] = @_findRowIn(yr[1], object.mbounds.x1)
      if xr
        delete yr[1][xi]    if not xr.length
        delete @objects[yi] if not yr[1].length
      else
        console.log "Couldn't find x = #{x} in @objects?" if not xr
    else
      console.log "Couldn't find y = #{y} in @objects?"

  each: (fn) ->
    for [y, objectsByY] in @objects
      for [x, objectsByX] in objectsByY
        for object in objectsByX
          ret = fn(object)
          return if ret is false

  getObjects: ->
    objects = []
    @each (object) -> objects.push(object)
    return objects

  # Public: Iterate through the stored @objects, which are sorted first by Y
  # and then by X.
  #
  # fn        - A Function which will be called with each object in @objects.
  # exception - An optional object which will be skipped over when iterating.
  #
  # each: (fn, exception) ->
  #   for [y, objectsByY] in @objects
  #     for [x, objectsByX] in objectsByY
  #       for object in objectsByX
  #         continue if exception and object is exception
  #         ret = fn(object)
  #         break if ret is false

  # Public: Create a subset of the collection where all objects fit within the
  # given Bounds.
  #
  # bounds - An Instance of Bounds.
  #
  # Returns a new SortedObjectCollection.
  #
  # getFramedWithin: (bounds) ->
  #   {x1, x2, y1, y2} = bounds
  #   objects = []
  #   $.v.each @objects, ([y, objectsByY]) ->
  #     if y1 <= y <= y2
  #       slicedObjectsByY = []
  #       $.v.each objectsByY, ([x, objectsByX]) ->
  #         if x1 <= x <= x2
  #           slicedObjectsByY.push([x, objectsByX])
  #       objects.push([y, slicedObjectsByY])
  #   @create(@map, @objects, @exception)

  # Internal: Find an item in the array which is the first level of @objects
  # which corresponds to the given `y`. If `y` cannot be found in the array,
  # then a place for it is created.
  #
  # objectsByY - An Array which looks like:
  #              [[y1, dataForY1], [y2, dataForY2], ...]
  # y          - An Integer y1 value of a map object.
  #
  # Returns the Integer index of an element in `objectsByY`.
  #
  _findOrCreateRowIn: (objects, coord) ->
    [idx, row] = @_findRowIn(objects, coord)
    if idx
      if not row
        # There aren't any objects stored under the given `coord` yet, so create
        # an entry.
        row = [coord, []]
        objects.splice(idx, 0, row)
      return [idx, row]
    else
      row = [coord, []]
      objects.push(row)
      return [0, row]

  # Adapted from:
  # * http://snippets.dzone.com/posts/show/11531
  # * http://rosettacode.org/wiki/Binary_search
  #
  _findRowIn: (objects, coord) ->
    if not objects.length
      return [null]

    [a, b] = [0, objects.length-1]
    loop
      # If a is greater than b, then nothing has been stored under `coord` yet.
      return [a, null] if a > b
      # Divide the haystack into two halves centered on a midpoint element.
      mid = Math.floor((a + b) / 2)
      # If some objects already exist which have the given `coord`, then return
      # the index at which they appear.
      return [mid, objects[mid]] if coord is objects[mid][0]
      if coord > objects[mid][0]
        # Reduce the haystack to the second half.
        a = mid + 1
      else
        # Reduce the haystack to the first half.
        b = mid - 1

SortedObjectCollection.aliases
  add: 'push'
  remove: 'delete'

game.SortedObjectCollection = SortedObjectCollection

window.scriptLoaded('app/sorted_object_collection')
