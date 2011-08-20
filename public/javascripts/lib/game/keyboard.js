(function() {
  $["export"]("SpriteEditor.Keyboard", function(SpriteEditor) {
    var Keyboard, keys;
    Keyboard = {};
    SpriteEditor.DOMEventHelpers.mixin(Keyboard, "SpriteEditor_Keyboard");
    keys = {
      TAB_KEY: 9,
      ESC_KEY: 27,
      SHIFT_KEY: 16,
      CTRL_KEY: 17,
      ALT_KEY: 18,
      META_KEY: 91,
      KEY_1: 49,
      KEY_2: 50,
      KEY_3: 51,
      KEY_4: 52,
      E_KEY: 69,
      G_KEY: 71,
      Q_KEY: 81,
      S_KEY: 83,
      X_KEY: 88,
      Z_KEY: 90
    };
    $.extend(Keyboard, keys);
    $.extend(Keyboard, {
      keys: keys,
      modifierKeys: [16, 17, 18, 91],
      init: function() {
        if (!this.isInitialized) {
          this.reset();
          this.isInitialized = true;
        }
        return this;
      },
      reset: function() {
        this.pressedKeys = {};
        return this;
      },
      destroy: function() {
        if (this.isInitialized) {
          this.reset();
          this.removeEvents();
          this.isInitialized = false;
        }
        return this;
      },
      addEvents: function() {
        var self;
        self = this;
        this._bindEvents(document, {
          keydown: function(event) {
            return self.pressedKeys[event.keyCode] = 1;
          },
          keyup: function(event) {
            return delete self.pressedKeys[event.keyCode];
          }
        });
        this._bindEvents(window, {
          blur: function(event) {
            return self.reset();
          }
        });
        return this;
      },
      removeEvents: function() {
        this._unbindEvents(document, "keydown", "keyup");
        this._unbindEvents(window, "blur");
        return this;
      },
      isKeyPressed: function(key) {
        if (typeof key === "string") {
          if (!(key = this.keys[key])) {
            throw new Error("'" + key + "' is not a valid key");
          }
        }
        return this.pressedKeys.hasOwnProperty(key);
      },
      modifierKeyPressed: function(event) {
        return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
      }
    });
    return Keyboard;
  });
}).call(this);
