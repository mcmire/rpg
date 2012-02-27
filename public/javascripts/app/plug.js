(function() {
  var __slice = [].slice;

  define(function(require) {
    var Class, PluginCollection, isValidRole, meta, module, plug, plugInto, roles, _ref;
    _ref = require('app/meta'), Class = _ref.Class, module = _ref.module;
    meta = require('app/meta2');
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
                if (obj.inst.can(roleName.long)) {
                  _results.push(obj);
                }
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
            var _ref1;
            (_ref1 = obj.inst)[methodName].apply(_ref1, args);
            return true;
          });
        },
        every: function(propName) {
          var ret;
          ret = true;
          this.each(function(obj) {
            if (!obj.inst[propName]) {
              return (ret = false);
            }
          });
          return ret;
        },
        each: function(fn) {
          var obj, ret, _i, _len, _ref1, _results;
          _ref1 = this.objs;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            obj = _ref1[_i];
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
    plug = meta.def('game.plug');
    plugInto = function() {
      var ctor, ctors, mixins, mod, owner, roleNames, uniqRoleNames, _i, _len;
      owner = arguments[0], ctors = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      for (_i = 0, _len = ctors.length; _i < _len; _i++) {
        ctor = ctors[_i];
        ctor.assignTo(owner);
      }
      uniqRoleNames = $.v.reduce(ctors, function(roleNames, ctor) {
        var ctorRoleNames, roleName, _j, _len1;
        ctorRoleNames = $.v.filter($.v.keys(ctor.__mixins__), function(k) {
          return isValidRole[k];
        });
        for (_j = 0, _len1 = ctorRoleNames.length; _j < _len1; _j++) {
          roleName = ctorRoleNames[_j];
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
      mod = meta.def('game.plug');
      mixins = [];
      $.v.each(roleNames, function(roleName) {
        var mixin;
        mixin = {};
        $.v.each(roles[roleName.short], function(prop, val) {
          if (/^__/.test(prop)) {
            return;
          }
          if (!roles[roleName.short].hasOwnProperty(prop)) {
            return;
          }
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
            var _base;
            plug[obj.ctorName] = obj.inst;
            return typeof (_base = obj.inst).__plugged__ === "function" ? _base.__plugged__(plug) : void 0;
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

  window.numScriptsLoaded++;

}).call(this);
