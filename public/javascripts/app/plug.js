var __slice = Array.prototype.slice;

define(function(require) {
  var Class, PluginCollection, isValidRole, module, plug, roles, _ref;
  _ref = require('app/meta'), Class = _ref.Class, module = _ref.module;
  roles = require('app/roles');
  isValidRole = $.v.reduce(roles.ROLES, (function(h, r) {
    h[r] = 1;
    return h;
  }), {});
  PluginCollection = Class.extend('game.PluginCollection', {
    statics: {
      collect: function(owner, ctors, roleNames, callback) {
        var allObjs, coll;
        allObjs = $.v.map(ctors, function(ctor) {
          var ctorName, inst, obj;
          ctorName = ctor.__name__.split('.')[1];
          inst = ctor.init(owner);
          obj = {
            ctor: ctor,
            ctorName: ctorName,
            inst: inst
          };
          callback(obj);
          return obj;
        });
        coll = {};
        $.v.each(roleNames, function(roleName) {
          var obj, objs;
          objs = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = allObjs.length; _i < _len; _i++) {
              obj = allObjs[_i];
              if (obj.inst.can(roleName.long)) _results.push(obj);
            }
            return _results;
          })();
          return coll[roleName.short] = new PluginCollection(owner, objs, roleName);
        });
        coll.all = new PluginCollection(owner, allObjs);
        return coll;
      }
    },
    members: {
      init: function(owner, objs, roleName) {
        this.owner = owner;
        this.objs = objs;
        this.roleName = roleName;
      },
      run: function() {
        var args, methodName;
        methodName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.each(function(obj) {
          var _ref2;
          (_ref2 = obj.inst)[methodName].apply(_ref2, args);
          return true;
        });
      },
      every: function(propName) {
        var ret;
        ret = true;
        this.each(function(obj) {
          if (!obj.inst[propName]) return (ret = false);
        });
        return ret;
      },
      each: function(fn) {
        var obj, ret, _i, _len, _ref2, _results;
        _ref2 = this.objs;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          obj = _ref2[_i];
          if (!(ret = fn(obj))) {
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  });
  plug = function() {
    var ctors, mixins, mod, roleNames, uniqRoleNames;
    ctors = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    uniqRoleNames = $.v.reduce(ctors, function(roleNames, ctor) {
      var ctorRoleNames, roleName, _i, _len;
      ctorRoleNames = $.v.filter($.v.keys(ctor.__roles__), function(k) {
        return isValidRole[k];
      });
      for (_i = 0, _len = ctorRoleNames.length; _i < _len; _i++) {
        roleName = ctorRoleNames[_i];
        roleNames[roleName] = 1;
      }
      return roleNames;
    }, {});
    roleNames = $.v.map(uniqRoleNames, function(roleName, _) {
      var roleShortName;
      roleShortName = roleName.split('.')[1];
      return {
        short: roleShortName,
        long: roleName
      };
    });
    mod = module('game.plug');
    mixins = [];
    $.v.each(roleNames, function(roleName) {
      var mixin;
      mixin = {};
      $.v.each(roles[roleName.short], function(prop, val) {
        if (/^__/.test(prop)) return;
        if (!roles[roleName.short].hasOwnProperty(prop)) return;
        if (typeof val === 'function') {
          return mixin[prop] = function() {
            return this.plugins[roleName.short].run(prop, arguments);
          };
        } else {
          return mixin[prop] = function() {
            return this.plugins[roleName.short].every(prop);
          };
        }
      });
      mixins.push(roles[roleName.short]);
      mixins.push(mixin);
      return mixin;
    });
    mod.extend.apply(mod, __slice.call(mixins).concat([{
      init: function() {
        plug = this;
        this.plugins = PluginCollection.collect(this, ctors, roleNames, function(obj) {
          plug[obj.ctorName] = obj.inst;
          if (typeof obj.inst.__plugged__ === 'function') {
            return obj.inst.__plugged__(plug);
          }
        });
        return this;
      },
      destroy: function() {
        this.plugins.all.run('destroy');
        return this._super();
      }
    }]));
    return mod;
  };
  return plug;
});
