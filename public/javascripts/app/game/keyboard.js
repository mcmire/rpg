(function() {
  var game,
    __slice = Array.prototype.slice;

  (game = this.game).define('keyboard', function(name) {
    var KEYS, KeyTracker, MODIFIER_KEYS, PressedKeys, keyboard;
    KEYS = {
      KEY_TAB: 9,
      KEY_ESC: 27,
      KEY_SHIFT: 16,
      KEY_CTRL: 17,
      KEY_ALT: 18,
      KEY_META: 91,
      KEY_UP: 38,
      KEY_DOWN: 40,
      KEY_LEFT: 37,
      KEY_RIGHT: 39,
      KEY_W: 87,
      KEY_A: 65,
      KEY_S: 83,
      KEY_D: 68,
      KEY_H: 72,
      KEY_J: 74,
      KEY_K: 75,
      KEY_L: 76
    };
    MODIFIER_KEYS = [KEYS.KEY_SHIFT, KEYS.KEY_CTRL, KEYS.KEY_ALT, KEYS.KEY_META];
    PressedKeys = this.meta.def('PressedKeys', {
      init: function() {
        return this.reset();
      },
      reset: function() {
        this.tsByKey = {};
        return this.keys = [];
      },
      get: function(key) {
        return this.tsByKey[key];
      },
      put: function(key, ts) {
        if (this.has(key)) this.del(key);
        this.tsByKey[key] = ts;
        return this.keys.unshift(key);
      },
      del: function(key) {
        var ts;
        if (this.has(key)) {
          ts = this.tsByKey[key];
          delete this.tsByKey[key];
          return this.keys.splice(this.keys.indexOf(key), 1);
        }
      },
      has: function(key) {
        return this.tsByKey.hasOwnProperty(key);
      },
      each: function(fn) {
        var key, _i, _len, _ref, _results;
        _ref = this.keys;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          _results.push(fn(key, this.tsByKey[key]));
        }
        return _results;
      }
    });
    KeyTracker = this.meta.def('KeyTracker', {
      init: function(keyCodes) {
        this.trackedKeys = $.v.reduce(keyCodes, (function(o, c) {
          o[c] = 1;
          return o;
        }), {});
        return this.pressedKeys = PressedKeys.create();
      },
      reset: function() {
        this.pressedKeys.reset();
        return this;
      },
      keydown: function(keyCode, ts) {
        if (this.trackedKeys.hasOwnProperty(keyCode)) {
          this.pressedKeys.put(keyCode, ts);
          return true;
        }
        return false;
      },
      keyup: function(keyCode) {
        if (this.trackedKeys.hasOwnProperty(keyCode)) {
          this.pressedKeys.del(keyCode);
          return true;
        }
        return false;
      },
      isKeyPressed: function() {
        var key, keyCode, keys, _i, _len, _ref;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _ref = $.flatten(keys);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          keyCode = keyboard.keyCodeFor(key);
          if (self.pressedKeys.has(keyCode)) return true;
        }
        return false;
      },
      clearStuckKeys: function(now) {
        var self;
        self = this;
        return this.pressedKeys.each(function(key, ts) {
          if ((now - ts) >= 500) return self.pressedKeys.del(key);
        });
      },
      getLastPressedKey: function() {
        return this.pressedKeys.keys[0];
      }
    });
    keyboard = meta.def('keyboard', this.eventable, {
      KeyTracker: KeyTracker,
      keys: KEYS,
      modifierKeys: MODIFIER_KEYS,
      keyTrackers: [],
      reset: function() {
        var keyTracker, _i, _len, _ref;
        if (this.keyTrackers) {
          _ref = this.keyTrackers;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            keyTracker = _ref[_i];
            keyTracker.reset();
          }
        }
        return this;
      },
      addEvents: function() {
        var self;
        self = this;
        this.bindEvents(document, {
          keydown: function(event) {
            var isTracked, key, keyTracker, _i, _len, _ref;
            key = event.keyCode;
            isTracked = false;
            _ref = self.keyTrackers;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              keyTracker = _ref[_i];
              if (keyTracker.keydown(key, event.timeStamp)) isTracked = true;
            }
            if (isTracked) {
              event.preventDefault();
              return false;
            }
          },
          keyup: function(event) {
            var isTracked, key, keyTracker, _i, _len, _ref;
            key = event.keyCode;
            isTracked = false;
            _ref = self.keyTrackers;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              keyTracker = _ref[_i];
              if (keyTracker.keyup(key)) isTracked = true;
            }
            if (isTracked) {
              event.preventDefault();
              return false;
            }
          }
        });
        this.bindEvents(window, {
          blur: function(event) {
            return self.reset();
          }
        });
        return this;
      },
      removeEvents: function() {
        this.unbindEvents(document, 'keydown', 'keyup');
        this.unbindEvents(window, 'blur');
        return this;
      },
      addKeyTracker: function(tracker) {
        this.keyTrackers.push(tracker);
        return this;
      },
      removeKeyTracker: function(tracker) {
        this.keyTrackers.splice(this.keyTrackers.indexOf(tracker), 1);
        return this;
      },
      trapKeys: function() {
        var key, keys, _i, _len;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        keys = game.util.ensureArray(keys);
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          key = keys[_i];
          if (typeof key === 'string') key = KEYS[key];
          this.trappedKeys[key] = 1;
        }
        return this;
      },
      releaseKeys: function() {
        var key, keys, _i, _len;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        keys = game.util.ensureArray(keys);
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          key = keys[_i];
          if (typeof key === 'string') key = KEYS[key];
          delete this.trappedKeys[key];
        }
        return this;
      },
      isKeyPressed: function() {
        var keys, tracker;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if ((function() {
          var _i, _len, _ref, _results;
          _ref = this.keyTrackers;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            tracker = _ref[_i];
            _results.push(tracker.isKeyPressed(keys));
          }
          return _results;
        }).call(this)) {
          return true;
        }
        return false;
      },
      clearStuckKeys: function(now) {
        var tracker, _i, _len, _ref;
        _ref = this.keyTrackers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tracker = _ref[_i];
          tracker.clearStuckKeys(now);
        }
        return this;
      },
      modifierKeyPressed: function(event) {
        return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
      },
      keyCodesFor: function() {
        var keys;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        keys = game.util.ensureArray(keys);
        return $.map(keys, function(key) {
          return keyboard.keyCodeFor(key);
        });
      },
      keyCodeFor: function(key) {
        var keyCode;
        if (typeof key === 'string') {
          keyCode = KEYS[key];
          if (!keyCode) throw new Error("'" + arg + "' is not a valid key");
          return keyCode;
        } else {
          return key;
        }
      }
    });
    return keyboard;
  });

}).call(this);
