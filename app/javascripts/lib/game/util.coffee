game = window.game

# A module is just an object, but which has a '__name' property equal to its
# object path. An object path is just a string of identifiers, separated by
# ".". With that in mind, this method creates an object at the given object
# path. Any objects leading up to the final module object will be
# autocreated if they do not exist. An object may be given which will specify
# the initial value of the module object.
#
# For instance:
#
#   util.module "Foo.Bar.Baz", {bleep: true, bloop: "foo"}
#
# is equivalent to doing the following:
#
#   Foo = {__name: "Foo"}
#   Foo.Bar = {__name: "Foo.Bar"}
#   Foo.Bar.Baz = {__name: "Foo.Bar.Baz", bleep: true, bloop: "foo"}
#
# Optionally, an array of objects may be specified as the second
# argument before the given initial object value. These objects will be
# mixed into the final object. For instance, this:
#
#   mixin1 = {zing: "blaz"}
#   mixin2 = {zang: "flaz"}
#   util.module "Foo.Bar.Baz", [mixin1, mixin2], {
#     bleep: true
#     bloop: "foo"
#   }
#
# results in this:
#
#   Foo = {__name: "Foo"}
#   Foo.Bar = {__name: "Foo.Bar"}
#   Foo.Bar.Baz = {
#     bleep: true
#     bloop: "foo"
#     zing: "blaz"
#     zang: "flaz"
#   }
#
# The new module object will be returned, so that you may say this
# instead:
#
#   mixin1 = {zing: "blaz"}
#   mixin2 = {zang: "flaz"}
#   Baz = util.module "Foo.Bar.Baz"
#   $.extend Baz, mixin1, mixin2, {
#     bleep: true
#     bloop: "foo"
#   }
#
_module = (chainStrs, args...) ->
  newObj = {}
  mixins = []
  switch args.length
    when 2 then [mixins, newObj] = args
    when 1 then newObj = args[0]

  if mixins
    mixins = [mixins] unless $.v.is.arr(mixins)
    $.extend newObj, mixin for mixin in mixins

  chainStrs = chainStrs.split(".") if typeof chainStrs is "string"
  newObj.__name = chainStrs.join(".")
  newIdStr = chainStrs.pop()
  tail = _ns(chainStrs)
  chain = _chain(chainStrs)
  newObj = newObj.apply(newObj, chain) if typeof newObj is "function"
  tail[newIdStr] = newObj
  newObj

# Given a string which represents a chain of objects (separated by "."),
# ensures that all objects in the chain exist (by creating them if they don't),
# and then returns the final object.
#
# For instance, given "Foo.Bar.Baz", `Foo` would be created if it doesn't
# exist, then `Foo.Bar`, then `Foo.Bar.Baz`; and then `Foo.Bar.Baz` would be
# returned.
#
_ns = (chainStrs) ->
  context = window
  chainStrs = chainStrs.split(".") if typeof chainStrs == "string"
  i = 0
  while i < chainStrs.length
    idStr = chainStrs[i]
    name = chainStrs.slice(0, i+1).join(".")
    context[idStr] ?= {__name: name}
    context = context[idStr]
    i++
  context

# Given a string which represents a chain of objects (separated by "."),
# returns the objects in the chain (assuming they exist).
#
# For instance, given "Foo.Bar.Baz", returns [Foo, Foo.Bar, Foo.Bar.Baz].
#
_chain = (chainStrs) ->
  obj = window
  chainStrs = chainStrs.split(".") if typeof chainStrs == "string"
  chain = []
  for idStr in chainStrs
    obj = obj[idStr]
    chain.push(obj)
  chain

_module "game.util",
  module: _module,

  # Returns a random number between min (inclusive) and max (exclusive).
  #
  # (Copied from the MDC wiki)
  #
  randomFloat: (min, max) ->
    Math.random() * (max - min) + min

  # Returns a random integer between min (inclusive) and max (exclusive?).
  # Using Math.round() will give you a non-uniform distribution!
  #
  # (Copied from the MDC wiki)
  #
  randomInt: (min, max) ->
    Math.floor(Math.random() * (max - min + 1)) + min

  # Capitalize a string.
  #
  capitalize: (str) ->
    return "" unless str
    str[0].toUpperCase() + str.slice(1)

