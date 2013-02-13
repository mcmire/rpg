
define 'meta', ->
  # Notice that the test is for /\b_super\(/ not /\b_super\b/: this is so the
  # function returned by _wrap() below does not get detected as a function
  # containing _super in case it is ever double-wrapped.
  _fnContainsSuper = (fn) -> /\b_super(?:\.apply)?\(/.test(fn)

  _wrap = (original, _super) ->
    # TODO: Is this even a good idea? Since mixins can be mixed into other
    # objects in any order, a call to @_super() is really really confusing...
    # maybe just do it when overriding prototype methods but not when
    # overriding mixin methods?
    newfn = ->
      tmp = @_super
      # Remember that we defined _super with defineProperty in the `proto` object.
      # If we do not set it using defineProperty below, then Firefox
      # (specifically FF 11) secretly, silently drops it! Go figure!!
      Object.defineProperty this, '_super',
        value: _super
        configurable: true
      ret = original.apply(this, arguments)
      Object.defineProperty this, '_super',
        value: tmp
        configurable: true
      return ret
    # These are mainly used for debugging purposes, but they are also used to
    # detect if a function has been wrapped and re-wrap it depending on context
    # when an object is mixed into another object.
    newfn.__original__ = original
    newfn.__super__ = _super
    return newfn

  _clone = (obj) ->
    Object.create(obj)

  _extend = (base, mixin, opts={}) ->
    exclusions =
      if opts.without
        $.v.reduce($.v.flatten([opts.without]), ((h,v) -> h[v] = 1; h); {})
      else
        {}
    keyTranslations = opts.keyTranslations || {}
    _super = base

    # Prevent mixins from being mixed in twice
    return if base.doesInclude?(mixin)

    properBaseName = base.__name__ or 'A_BASE'
    properMixinName = mixin.__name__ or 'A_MIXIN'
    # console.log "Mixing #{properMixinName} into #{properBaseName}"

    for own sk of mixin
      continue if exclusions[sk]
      tk = keyTranslations[sk] || sk
      if (
        typeof mixin[sk] is 'function' and
        mixin[sk].__original__?
      )
        # If a module has a function that contains _super, it has already been
        # wrapped. The problem is that an attempt to mix it into this object
        # will result in a double-wrapped function; plus, the original
        # object's _super call will also most likely refer to the default _super
        # function (which is an empty function). So, here we unwrap the function
        # and re-wrap it in this context.
        ##console.log "}{ #{properMixinName}[#{sk}] }{ -> #{properBaseName}[#{tk}]"
        base[tk] = _wrap(mixin[sk].__original__, _super[tk])
      else if (
        typeof mixin[sk] is 'function' and
        _fnContainsSuper(mixin[sk]) and
        typeof _super[tk] is 'function'
      )
        # If base and the object we're mixing into the object both have a
        # function with the same name, and the mixin's function contains a call
        # to _super(), replace base's function with the mixin's function, but
        # first wrap the mixin's function in another function that sets _super
        # to the base function.
        ##console.log "{ #{properMixinName}[#{sk}] } -> #{properBaseName}[#{tk}]"
        base[tk] = _wrap(mixin[sk], _super[tk])
      else
        ##console.log "#{properMixinName}[#{sk}] -> #{properBaseName}[#{tk}]"
        base[tk] = mixin[sk]

      # Call extended hook
      mixin.__extended__?(base)

    return base

  proto = {}
  Object.defineProperty proto, '__name__',
    value: 'game.meta.proto',
    configurable: true
  Object.defineProperty proto, '_super',
    value: ->,
    configurable: true
  proto.clone = ->
    clone = _clone(this)
    # Copy this so if clone adds to mixins then it won't get added to prototype
    # and thus possibly prevent future objects from being able to be mixed in
    Object.defineProperty clone, '__mixins__',
      value: require('util').dup(@__mixins__)
      configurable: true
    return clone
  proto.cloneAs = (name) ->
    clone = @clone()
    Object.defineProperty clone, '__name__',
      value: name
      configurable: true
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
  proto.aliases = (map) ->
    self = this
    $.v.each map, (orig, aliases) ->
      aliases = [aliases] unless $.v.is.arr(aliases)
      self[alias] = self[orig] for alias in aliases
    return this
  proto.doesInclude = (obj) ->
    if typeof obj is 'string'
      @__mixins__[obj]
    else if obj.__name__
      @__mixins__[obj.__name__]

  _def = (mixins...) ->
    name = mixins.shift() if typeof mixins[0] is 'string'
    obj = _clone(proto)
    if name
      Object.defineProperty obj, '__name__',
        value: name
        configurable: true
    Object.defineProperty obj, '__mixins__',
      value: {}
      configurable: true
    obj.extend(mixins...)
    return obj

  return {
    def: _def
    extend: _extend
    clone: _clone
  }
