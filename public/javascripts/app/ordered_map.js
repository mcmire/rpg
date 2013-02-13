(function() {
  var OrderedMap, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  OrderedMap = meta.def('game.OrderedMap', {
    init: function() {
      this.keys = [];
      return this.map = {};
    },
    get: function(k) {
      return this.map[k];
    },
    set: function(k, v) {
      this.keys.push(k);
      this.map[k] = v;
      this.keys = this.keys.sort();
      return v;
    },
    "delete": function(k) {
      this.keys["delete"](k);
      return delete this.map[k];
    },
    each: function(fn) {
      var k, ret, v, _i, _len, _ref;
      _ref = this.keys;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        if (k != null) {
          v = this.map[k];
          ret = fn(v);
          if (ret === false) {
            return false;
          }
        }
      }
    },
    getKeys: function() {
      return this.keys;
    },
    getValues: function(fn) {
      var values;
      values = [];
      this.each(function(v) {
        return values.push(v);
      });
      return values;
    },
    isEmpty: function() {
      return this.keys.length === 0;
    }
  });

  game.OrderedMap = OrderedMap;

  window.scriptLoaded('app/ordered_map');

}).call(this);
