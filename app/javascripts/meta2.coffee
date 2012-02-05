define (require) ->
  _fnContainsSuper = (fn) -> /\b_super\b/.test(fn)

  _wrap = (k, fn, val) ->
    return ->
      tmp = @_super
      @_super = val
      ret = fn.apply(this, arguments)
      @_super = tmp
      return ret

  _clone = (obj) ->
    Object.create(obj)

  _extend = (base, mixin, opts={}) ->
    exclusions =
      if opts.without
        $.v.reduce($.v.flatten([opts.without]), ((h,v) -> h[v] = 1; h); {})
      else
        {}
    # key_translations = base.__key_translations__ || {}
    keyTranslations = opts.keyTranslations || {}
    _super = base

    # Prevent mixins from being mixed in twice
    return if base.includes?(mixin)

    for own sk of mixin
      continue if exclusions[sk]
      tk = keyTranslations[sk] || sk
      # TODO: Is this even a good idea? Since mixins can be mixed into other
      # objects in any order, a call to @_super() is really really confusing...
      # maybe just do it when overriding prototype methods but not when
      # overriding mixin methods?
      if typeof mixin[sk] is 'function' and _fnContainsSuper(mixin[sk])
        if typeof _super[tk] is 'function'
          base[tk] = _wrap(sk, mixin[sk], _super[tk])
        else
          # The current method has no equivalent higher up in the inheritance
          # chain, so rewrite the method so that if _super is called nothing
          # happens. This is to prevent a recursive call in the case where this
          # method does have an equivalent in a *subclass* (and is therefore
          # being called via _super) - in this case _super refers to this same
          # method and so calling it results in us calling ourselves.
          # Additionally, we could also throw an exception here, except that
          # this would not do for modules, for which (unlike classes) _super may
          # actually exist depending on where the module is mixed in (since a
          # module can be mixed in anywhere).
          #
          # TODO: This may not work if super is called multiple times in a
          # subclass, investigate
          #
          base[tk] = _wrap(sk, mixin[sk], ->)
      else
        base[tk] = mixin[sk]

      # Call extended hook
      mixin.__extended__?(base)

    return base

  proto = {}
  # proto.__key_translations__ = {}
  proto.clone = ->
    _clone(this)
  proto.cloneAs = (name) ->
    clone = @clone()
    clone.__name__ = name
    return clone
  proto.create = (args...) ->
    clone = @clone()
    clone.init(args...)
    return clone
  proto.init = ->
    return this
  proto._includeMixin = (mixin, opts={}) ->
    _extend(this, mixin, opts)
    @__mixins__[mixin.__name__] = 1 if mixin.__name__
    return this
  proto.include =
  proto.extend = (mixins...) ->
    @_includeMixin(mixin) for mixin in mixins
    return this
  proto.doesInclude = (obj) ->
    obj.__name__ and @__mixins__[obj.__name__]
    return this
  # proto.addTranslations = (obj) ->
  #   # write property in own properties so it doesn't modify
  #   # proto.__key_translations__
  #   @__key_translations__ = $.v.extend {}, @__key_translations__, obj

  _def = (mixins...) ->
    name = mixins.shift() if typeof mixins[0] is 'string'
    obj = _clone(proto)
    Object.defineProperty obj, '__name__', value: name if name
    Object.defineProperty obj, '__mixins__', value: {}
    obj.extend(mixins...)
    return obj

  return {
    def: _def
    extend: _extend
    clone: _clone
  }
