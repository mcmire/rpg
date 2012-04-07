
define 'util', ->

  # Public: Make modifications to an object by copying properties from other
  # objects, either shallowly or deeply.
  #
  # This is different from the `extend` method that Valentine provides because
  # it supports copying arrays.
  #
  # deep    - If true, then properties are copied deeply, otherwise shallowly.
  #           Copying deeply means that if the value of the property being
  #           copied over is a plain Object or an Array, then we clone it
  #           completely rather than merely bringing over a reference to it.
  #           (Default: false)
  # target  - A plain Object or Array which will receive the modifications.
  # objects - An array of plain Objects or Arrays which will be copied to the
  #           `target`.
  #
  # Returns a modified version of `target`.
  #
  extend = (args...) ->
    if typeof args[0] is 'boolean'
      deep = args.shift()
    else
      deep = false
    target = args.shift()
    objects = args

    for obj in objects
      for own prop of obj
        if deep and ($.v.is.obj(obj[prop]) or $.v.is.arr(obj[prop]))
          target[prop] = clone obj[prop]
        else
          target[prop] = obj[prop]

    return target

  # Public: Make a deep copy of the given object.
  #
  # obj - An plain Object or an Array.
  #
  # Returns an Object of the same type as the given Object.
  #
  clone = (obj) ->
    if $.v.is.arr(obj)
      extend true, [], obj
    else if isPlainObject(obj)
      extend true, {}, obj
    else
      obj

  # Public: Make a shallow copy of the given object.
  #
  # obj - An plain Object or an Array.
  #
  # Returns an Object of the same type as the given Object.
  #
  dup = (obj) ->
    if $.v.is.arr(obj)
      extend false, [], obj
    else if isPlainObject(obj)
      extend false, {}, obj
    else
      obj

  isPlainObject = (obj) ->
    $.v.is.obj(obj) and obj.constructor is Object

  # DEPRECATED (use Object.create() directly)
  createFromProto = (obj) ->
    Object.create(obj)

  randomItem = (arr) ->
    arr[randomInt(arr.length-1)]

  randomInt = (args...) ->
    if args.length is 1
      [min, max] = [0, args[0]]
    else
      [min, max] = args
    Math.floor(Math.random() * (max - min + 1)) + min

  capitalize = (str) ->
    str[0].toUpperCase() + str[1..-1]

  ensureArray = (arr) ->
    arr = arr[0] if arr.length is 1 and $.is.arr(arr[0])
    return arr

  arrayDelete = (arr, item) ->
    arr.splice(item, 1)

  arrayInclude = (arr, item) ->
    arr.indexOf(item) isnt -1

  cmp = (a, b) ->
    if a > b
      return 1
    else if a < b
      return -1
    else
      return 0

  hashWithout = (hash, keys...) ->
    hash2 = dup(hash)
    delete hash2[key] for key in keys
    return hash2

  return {
    extend: extend
    clone: clone
    dup: dup
    cmp: cmp

    array:
      delete: arrayDelete
      wrap: ensureArray
      random: randomItem
      include: arrayInclude
    int:
      random: randomInt
    string:
      capitalize: capitalize
    is:
      hash: isPlainObject
    hash:
      is: isPlainObject
      without: hashWithout

    # DEPRECATED
    isPlainObject: isPlainObject     # use is.hash() / hash.is()
    randomItem: randomItem           # use array.random()
    randomInt: randomInt             # use int.random
    capitalize: capitalize           # use string.capitalize()
    ensureArray: ensureArray         # use array.wrap()
    arrayDelete: arrayDelete         # use array.delete()

    # DEPRECATED
    createFromProto: createFromProto
  }
