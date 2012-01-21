var __slice = Array.prototype.slice;

define(function(require) {
  var ROLES, module, plug;
  module = require('app/meta').module;
  ROLES = require('app/roles').ROLES;
  plug = function() {
    var cons, ctor, ctors, k, mod, o, role, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref;
    ctors = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    mod = module('game.plug', {
      plugins: $.v.reduce(ROLES, (function(h, r) {
        h[r] = [];
        return h;
      }), {
        all: []
      }),
      destroy: function() {
        var o, _i, _len, _ref;
        _ref = this.plugins.all;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          o.destroy();
        }
        return this._super();
      },
      reset: function() {
        if (typeof this.detach === "function") this.detach();
        return this._super();
      }
    });
    for (_i = 0, _len = ROLES.length; _i < _len; _i++) {
      role = ROLES[_i];
      mod.plugins[role] = [];
    }
    for (_j = 0, _len2 = ctors.length; _j < _len2; _j++) {
      ctor = ctors[_j];
      cons = g[ctor];
      if (cons == null) {
        throw new Error("" + ctor + " doesn't seem to have been loaded yet?!");
      }
      o = mod[ctor] = g[ctor].init(mod);
      mod.plugins.all.push(o);
      for (_k = 0, _len3 = ROLES.length; _k < _len3; _k++) {
        role = ROLES[_k];
        if (o.can(role)) mod.plugins[role].push(o);
      }
    }
    for (_l = 0, _len4 = ROLES.length; _l < _len4; _l++) {
      role = ROLES[_l];
      _ref = g[role];
      for (_m = 0, _len5 = _ref.length; _m < _len5; _m++) {
        k = _ref[_m];
        mod[k] = function() {
          var o, _len6, _n, _ref2, _results;
          _ref2 = mod.plugins[role];
          _results = [];
          for (_n = 0, _len6 = _ref2.length; _n < _len6; _n++) {
            o = _ref2[_n];
            _results.push(o[k]());
          }
          return _results;
        };
      }
    }
    return mod;
  };
  return plug;
});
