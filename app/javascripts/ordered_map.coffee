game = (window.game ||= {})

meta = game.meta2

OrderedMap = meta.def 'game.OrderedMap',
  init: ->
    @keys = []
    @map = {}

  get: (k) -> @map[k]

  set: (k, v) ->
    @keys.push(k)
    @map[k] = v
    @keys = @keys.sort()
    return v

  delete: (k) ->
    @keys.delete(k)
    delete @map[k]

  each: (fn) ->
    for k in @keys
      # Have to add a check here... I guess what is happening is that
      # keys is getting modified while we are iterating over it thus by the time
      # this is called keys.length may be 1 less than when the loop started
      if k
        v = @map[k]
        ret = fn(v)
        return false if ret is false

  getKeys: -> @keys

  getValues: (fn) ->
    values = []
    @each (v) -> values.push(v)
    return values

  isEmpty: -> @keys.length is 0

game.OrderedMap = OrderedMap

window.scriptLoaded('app/ordered_map')
