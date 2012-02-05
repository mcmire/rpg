######
# THIS IS AN OLD FILE
######

define (require) ->
  {Class, module} = require('app/meta')
  meta = require('app/meta2')
  roles = require('app/roles')

  isValidRole = $.v.reduce roles.ROLES, ((h, r) -> h[r] = 1; h), {}

  PluginCollection = Class.extend 'game.PluginCollection',
    statics:
      collect: (owner, ctors, roleNames, callback) ->
        allObjs = $.v.map ctors, (ctor) ->
          ctorName = ctor.__name__.split('.')[1]
          inst = ctor.init(owner)
          obj = {ctor: ctor, ctorName: ctorName, inst: inst}
          callback(obj)
          return obj

        coll = {}
        $.v.each roleNames, (roleName) ->
          objs = (obj for obj in allObjs when obj.inst.can(roleName.long))
          coll[roleName.short] = new PluginCollection(owner, objs, roleName)
        coll.all = new PluginCollection(owner, allObjs)

        return coll

    members:
      init: (@owner, @objs, @roleName) ->

      run: (methodName, args...) ->
        @each (obj) ->
          obj.inst[methodName](args...)
          return true

      every: (propName) ->
        ret = true
        @each (obj) ->
          unless obj.inst[propName]
            return (ret = false)
        return ret

      each: (fn) ->
        for obj in @objs
          unless ret = fn(obj)
            break

  plug = meta.def 'game.plug'

  # A Plug has the ability to add plugins to itself. It (in theory) supports all
  # of the role interfaces, but does not enforce any.
  #
  plugInto = (owner, ctors...) ->
    ctor.assignTo(owner) for ctor in ctors

    uniqRoleNames = $.v.reduce ctors, (roleNames, ctor) ->
      # __mixins__ may contain names of non-role modules so filter down the list
      ctorRoleNames = $.v.filter($.v.keys(ctor.__mixins__), (k) -> isValidRole[k])
      roleNames[roleName] = 1 for roleName in ctorRoleNames
      roleNames
    , {}
    roleNames = $.v.map uniqRoleNames, (roleName, _) ->
      roleShortName = roleName.split('.')[1]
      {short: roleShortName, long: roleName}

    mod = meta.def('game.plug')

    mixins = []
    $.v.each roleNames, (roleName) ->
      # ex: name is 'game.eventable', shortName is 'eventable'
      mixin = {}
      # $.v.each roles.eventable, (prop, val) ->
      $.v.each roles[roleName.short], (prop, val) ->
        return if /^__/.test(prop)
        return unless roles[roleName.short].hasOwnProperty(prop)
        if typeof val is 'function'
          # mixin.addEvents = -> @plugins.eventable.run('addEvents', arguments)
          mixin[prop] = -> @plugins[roleName.short].run(prop, arguments)
        else
          # mixin.isLoaded = -> @plugins.loadable.every('isLoaded')
          mixin[prop] = -> @plugins[roleName.short].every(prop)

      # include the interface
      mixins.push(roles[roleName.short])
      # now include the implementation
      mixins.push(mixin)

      return mixin

    mod.extend mixins...,
      init: ->
        plug = this
        # we have to do this here so the plugins have access to the "plug"
        # (e.g. main or viewport)
        @plugins = PluginCollection.collect this, ctors, roleNames, (obj) ->
          # assign to the plug as we go along so that future plugins will
          # have access to assigned plugins through the plug (e.g.
          # collisionLayer having access to the viewport through main)
          plug[obj.ctorName] = obj.inst
          # call the 'plugged' hook if one exists
          obj.inst.__plugged__?(plug)
        return this

      destroy: ->
        @plugins.all.run('destroy')
        @_super()

    return mod

  return plug

window.numScriptsLoaded++
