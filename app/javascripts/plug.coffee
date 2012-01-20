g = window.game ||= {}

# A Plug has the ability to add plugins to itself. It (in theory) supports all
# of the role interfaces, but does not enforce any.
#
plug = (ctors...) ->
  mod = g.module 'game.plug',
    plugins: $.v.reduce(g.ROLES, ((h, r) -> h[r] = []; h), {all: []})

    destroy: ->
      o.destroy() for o in @plugins.all
      @_super()

    reset: ->
      @detach?()
      @_super()

  # mod.plugins.eventable = []
  mod.plugins[role] = [] for role in g.ROLES
  for ctor in ctors
    # o = mod.keyboard = g.keyboard.init(this)
    cons = g[ctor]
    unless cons?
      throw new Error "#{ctor} doesn't seem to have been loaded yet?!"
    o = mod[ctor] = g[ctor].init(mod)
    mod.plugins.all.push(o)
    for role in g.ROLES
      # mod.plugins.eventable.push(o) if o.can('eventable')
      mod.plugins[role].push(o) if o.can(role)

  for role in g.ROLES
    for own k in g[role]
      # mod.addEvents = -> o.addEvents() for o in mod.plugins.eventable
      mod[k] = -> o[k]() for o in mod.plugins[role]

  return mod

g.plug = plug
