(function() {
  var __slice = Array.prototype.slice;

  define('game.keyboard', function() {
    var KEYS, KeyTracker, MODIFIER_KEYS, PressedKeys, eventable, keyboard, meta;
    meta = require('meta');
    eventable = require('roles').eventable;
    KEYS = {
      KEY_BACKSPACE: 8,
      KEY_TAB: 9,
      KEY_ESC: 27,
      KEY_DELETE: 46,
      KEY_SHIFT: 16,
      KEY_CTRL: 17,
      KEY_ALT: 18,
      KEY_META: 91,
      KEY_UP: 38,
      KEY_DOWN: 40,
      KEY_LEFT: 37,
      KEY_RIGHT: 39,
      KEY_1: 49,
      KEY_2: 50,
      KEY_W: 87,
      KEY_A: 65,
      KEY_S: 83,
      KEY_D: 68,
      KEY_F: 70
    };
    MODIFIER_KEYS = [KEYS.KEY_SHIFT, KEYS.KEY_CTRL, KEYS.KEY_ALT, KEYS.KEY_META];
    PressedKeys = meta.def({
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
      getMostRecent: function() {
        return this.keys[0];
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
    KeyTracker = meta.def({
      KEY_TIMEOUT: 500,
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
        var keyCodes,
          _this = this;
        keyCodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return !!$.v.find(keyCodes, function(keyCode) {
          return _this.pressedKeys.has(keyCode);
        });
      },
      clearStuckKeys: function(now) {
        var _this = this;
        return this.pressedKeys.each(function(key, ts) {
          if ((now - ts) >= KEY_TIMEOUT) return _this.pressedKeys.del(key);
        });
      },
      getLastPressedKey: function() {
        return this.pressedKeys.getMostRecent();
      }
    });
    keyboard = meta.def(eventable, {
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
      isKeyPressed: function() {
        var evt, keys;
        evt = arguments[0], keys = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return $.includes(this.keyCodesFor(keys), evt.keyCode);
      },
      isTrackedKeyPressed: function() {
        var keys,
          _this = this;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return !!$.v.find(this.keyTrackers, function(tracker) {
          return tracker.isKeyPressed(_this.keyCodesFor(keyCodes));
        });
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
      keyCodesFor: function(keys) {
        var key, _i, _len, _ref, _results;
        _ref = $.flatten(keys);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          _results.push(this.keyCodeFor(key));
        }
        return _results;
      },
      keyCodeFor: function(key) {
        var givenKey, keyCode;
        givenKey = key;
        if (typeof key === 'string') {
          if (!/^KEY_/.test(key)) key = "KEY_" + (key.toUpperCase());
          keyCode = KEYS[key];
          if (!keyCode) {
            throw new Error("'" + givenKey + "' is not a known key. Known keys are: " + ($.v.keys(KEYS).join(", ")));
          }
          return keyCode;
        } else {
          return key;
        }
      }
    });
    keyboard.isKeyUnpressed = keyboard.isKeyPressed;
    return keyboard;
  });

}).call(this);
