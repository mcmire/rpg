g = window.game ||= {}

#---

_fnContainsSuper = (fn) -> /\b_super\b/.test(fn)

_wrap = (k, fn, val, cons) ->
  return ->
    if cons and not this instanceof cons
      # Support both `new Foo(...)` and `Foo.init()` syntaxes, so objects can be
      # created metaprogrammatically
      # http://ejohn.org/blog/simple-class-instantiation/
      return new cons(arguments)
    else
      tmp = @_super
      @_super = val
      ret = fn.apply(this, arguments)
      @_super = tmp
      return ret

_extend = (base, ext, _super=base, cons) ->
  for own k of ext
    continue if k is '__name__'
    if typeof ext[k] is 'function' and k is 'init'
      base[k] = _wrap(k, ext[k], _super[k], cons)
    else if typeof ext[k] is 'function' and _fnContainsSuper(ext[k])
      if typeof _super[k] is 'function'
        base[k] = _wrap(k, ext[k], _super[k])
      else
        # The current method has no equivalent higher up in the inheritance
        # chain, so rewrite the method so that if _super is called nothing
        # happens. This is to prevent a recursive call in the case where this
        # method does have an equivalent in a *subclass* (and is therefore being
        # called via _super) - in this case _super refers to this same
        # method and so calling it results in us calling ourselves.
        # Additionally, we could also throw an exception here, except that this
        # would not do for modules, for which (unlike classes) _super may
        # actually exist depending on where the module is mixed in (since a
        # module can be mixed in anywhere).
        # TODO: This will not work if super is called multiple times in a
        # subclass
        ###
        src = ext[k].toString()
        if match = /function[ ]?\((\w*)\) {((?:.|\n)+)}/m.exec(src)
          args = match[1]
          body = match[2]
          prebody = """
if (this._super === arguments.callee) {
  this._super = function() {
    // throw new Error('no superclass found')
  };
}
"""
          body = prebody + body
          base[k] = new Function(args, body)
        ###
        base[k] = _wrap(k, ext[k], ->)
        ###
        else
          base[k] = ext[k]
        ###
    else if $.v.is.arr(ext[k]) or $.v.is.obj(ext[k])
      base[k] = $.clone(ext[k])
    else
      base[k] = ext[k]

#---

# A class fabricator.
#
# The following is primarily lifted from John Resig's Simple JavaScript
# Inheritance[1], which was inspired by Dean Edwards' Base.js[2]. This is a
# pretty popular alternative to JavaScript's built-in "class" syntax;
# Prototype[3] (following Alex Arnell's ideas[4]), qooxdoo[5], and more recently
# Dustin Diaz's 'klass' library[6] all adopt a similar style.
#
# The reason we are using this instead of CoffeeScript's sexy class syntax is 1)
# to provide a base API of init(), reset(), and destroy(), and 2) because we
# also have a module fabricator, below, which borrows some of the behavior here
# (namely, the ability to call 'super').
#
# [1]: http://ejohn.org/blog/simple-javascript-inheritance
# [2]: http://dean.edwards.name/weblog/2006/03/base/
# [3]: https://github.com/sstephenson/prototype/blob/master/src/prototype/lang/class.js
# [4]: http://code.google.com/p/inheritance/
# [5]: http://manual.qooxdoo.org/1.6.x/pages/core/oo_feature_summary.html
# [6]: http://github.com/ded/klass

Class = ->
Class.__name__ = 'Class'
Class::init = ->
  @reset
Class::reset = ->
  throw new Error 'must be overridden'
Class::destroy = ->
  @reset()

# Public: Create a root class or a subclass.
#
# Signature:
#
# Class.extend([name], [mixin1, mixin2, ...], classdef)
#
# name     - The optional String full name of the class. Should include the
#            namespace, if any. (Default: null)
# mixinN   - An Object which will be mixed into the class as member properties.
# classdef - A plain object. If this object contains 'statics' and 'members'
#            properties, then the values of these properties are expected to
#            be objects themselves, and will be used to add static and member
#            properties to the class. Otherwise, it is expected that the plain
#            object merely contains member properties. Wherever it is, the
#            object of member properties may contain an 'init' property which
#            will be used as the constructor.
#
# Example:
#
#   Animal = Class.extend
#     statics:
#       animals: []
#     methods:
#       init: ->
#         @constructor.animals.push(this)
#         @isHungry = true
#       eat: ->
#         @isHungry = false
#
#   Mammal = Animal.extend
#     warmBlooded: true
#     speed: 2
#     move: ->
#       @x += @speed
#       @y += @speed
#
#   Person = Mammal.extend
#     speed: 10
#     init: ->
#       @_super()
#       @isWalking = false
#     move: ->
#       @_super()
#       @isWalking = true
#
#   animal = new Animal()
#   animal.isHungry  #=> true
#   Animal.animals.length  #=> 1
#
#   mammal = Mammal()   # yes this also works
#   mammal.isHungry  #=> true
#   mammal.eat()
#   mammal.isHungry  #=> false
#   mammal.speed  #=> 2
#   mammal.move()  #=> @x = 2, @y = 2
#   # static methods are deep cloned
#   Animal.animals.length  #=> 1
#   Mammal.animals.length  #=> 1
#
#   person = new Person()
#   person.isHungry  #=> true
#   person.eat()
#   person.isHungry  #=> false
#   person.isWalking  #=> false
#   person.speed  #=> 10
#   person.move()  #=> @x = 10, @y = 10
#   person.isWalking  #=> true
#   # static methods are deep cloned
#   Animal.animals.length  #=> 1
#   Mammal.animals.length  #=> 1
#   Person.animals.length  #=> 1
#
Class.extend = (args...) ->
  name = args.shift() if typeof args[0] is 'string'
  classdef = args.pop()
  mixins = args

  if typeof classdef is 'function'
    classdef = {init: classdef}
  if classdef.statics?
    statics = classdef.statics
    members = classdef.members
  else
    statics = {}
    members = classdef

  # Make a reference to the parent constructor (which is either a class we've
  # already made, or Class itself), and its prototype
  parentClass = this
  parentProto = parentClass.prototype
  # Now we need to create an instance of the parent class so that child
  # instances can inherit from it. The standard way to do this is via
  # childClass.prototype = parentInstance. The thing is, if we do this then we
  # need to skip the init code for the parent class. We can either have an
  # 'initializing' flag that we flip off in order to initialize the parent
  # instance and then flip back on, however that has issues if you are
  # subclassing a class you've already created due to the closure that the
  # constructor creates (by the time you call the parent constructor then the
  # flag will be flipped back on). So, we have to resort to inserting an extra
  # dummy object in the prototype chain which inherits from the parent
  # prototype.
  noop = ->
  noop.name = 'noop'
  noop.prototype = parentProto
  noop.prototype.constructor = parentClass
  parentInstance = new noop()

  # Generate a child class
  childClass = (args) ->
    # The init method actually does the real work
    # the "args.callee" will happen if called as Foo() instead of new Foo()
    # http://ejohn.org/blog/simple-class-instantiation/
    @init.apply(this, if args.callee then args else arguments)
    return this

  # Copy all of the static properties of the parent class to the child class
  # Do it here so that __name__, superclass, etc. as defined below will be
  # overridden if they get inherited from a superclass
  childClass[k] = v for own k, v of parentClass

  # Missing member properties of the child instance will inherit from the member
  # properties within the parent class (which is proxied by a 'noop' instance)
  childClass.prototype = parentInstance
  # Ensure that instances of the child class report the correct constructor
  # (otherwise it will be set to the 'noop' constructor)
  childClass.prototype.constructor = childClass
  # Store the name for debugging purposes
  childClass.__name__ = name
  # Store a reference to the parent class just for debugging purposes
  childClass.superclass = parentClass
  # And then make the child class subclassable
  childClass.extend = arguments.callee

  # Add some convenience methods for adding static and member properties

  childClass.static = (name, fn) ->
    obj = {}; obj[name] = fn
    @statics(obj)
    return this
  childClass.statics = (obj) ->
    # Copy `obj` to `this` (or, `childClass`) with `parentClass` as _super
    # reference
    _extend(this, obj, parentClass)
    return this

  childClass.member = (name, fn) ->
    obj = {}; obj[name] = fn
    @members(obj)
    return this
  childClass.members = (obj) ->
    # Copy `obj` to `parentInstance` (or, childClass.prototype) with
    # `parentProto` as _super reference
    _extend(parentInstance, obj, parentProto)
    return this

  childClass.prototype.method = (name, fn) ->
    obj = {}; obj[name] = fn
    @obj(obj)
    return this
  childClass.prototype.methods = (obj) ->
    # Copy `obj` to this (or, childClass.prototype) with `parentProto` as
    # _super reference
    _extend(this, obj, parentProto, childClass)
    return this

  # Add the specified static properties
  childClass.statics(statics) if statics
  # Add the specified member properties
  childClass.members(members)
  # Add any extra member properties
  childClass.members(obj) for obj in mixins

  return childClass

#---

# A module fabricator.
#
# Signature:
#
# module(name, mixin1, mixin2...)
#
# name   - The name of the module. Should include a namespace if necessary.
# mixinN - A plain Object which will be mixed into the module.
#
# Example:
#
#   mixin1 =
#     foo: 'bar'
#     baz: -> @a = 'b'
#   mixin2 =
#     zing: 'zang'
#   foo = module 'foo.bar', mixin1, mixin2,
#     bling: 'blang'
#     baz: ->
#       @_super()
#       @fraz = 'blaz'
#
#   foo.init()
#   foo.foo   #=> 'bar'
#   foo.zing  #=> 'zang'
#   foo.baz()
#   foo.a     #=> 'b'
#   foo.fraz  #=> 'blaz'
#
# Returns a plain Object.
#
module = (name, mixins...) ->
  mod = {}
  mod.__name__ = name
  mod.extend = (mixins...) ->
    _extend this, mixin for mixin in mixins
  # if you are adding a method that already exists, then _super will be set to
  # that method - this is a bit weird because you can "subclass" yourself by
  # extending your module with a method and then extend it again with a method
  # of the same name, but this feature is useful so I don't have a problem with it
  mod.methods = mod.extend
  mod.method = (name, fn) ->
    methods = {}; methods[name] = fn
    @methods(methods)

  mixin = {}
  mod.extend.apply(mixin, mixins)
  {init, reset, destroy} = mixin
  delete mixin.init
  delete mixin.reset
  delete mixin.destroy

  mod.init = ->
    unless @isInit
      @reset()
      init?.apply(this, arguments)
      @isInit = true
    return this

  mod.reset = ->
    reset?.apply(this, arguments)
    return this

  mod.destroy = ->
    if @isInit
      destroy?.apply(this, arguments)
      @reset()
      @isInit = false
    return this

  mod.extend(mixin)

  return mod

#---

g.module = module
g.Class  = Class
