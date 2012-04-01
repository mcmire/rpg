
define 'game.keyboard', ->
  meta = require('meta')
  {eventable} = require('roles')

  KEYS =
    KEY_BACKSPACE: 8
    KEY_TAB: 9
    KEY_ESC: 27
    KEY_DELETE: 46
    KEY_SHIFT: 16
    KEY_CTRL: 17
    KEY_ALT: 18
    KEY_META: 91
    KEY_UP: 38
    KEY_DOWN: 40
    KEY_LEFT: 37
    KEY_RIGHT: 39
    KEY_1: 49
    KEY_2: 50
    KEY_W: 87
    KEY_A: 65
    KEY_S: 83
    KEY_D: 68
    KEY_F: 70

  MODIFIER_KEYS = [
    KEYS.KEY_SHIFT
    KEYS.KEY_CTRL
    KEYS.KEY_ALT
    KEYS.KEY_META
  ]

  # PressedKeys is the internal data structure for the KeyTracker class. It is a
  # record of all keys that are currently being held down (yes, and that is
  # plural, so multiple keys can be tracked).  The keys are stored in a stack.
  # The idea is that we only ever care about the last key pressed, and if that
  # key is released and other keys are still being pressed then now our focus
  # moves to the last key before that one. The time that each key was pressed is
  # also stored; this makes it possible to discern whether any keys are "stuck"
  # and need to be unset.
  #
  PressedKeys = meta.def
    init: ->
      @reset()

    reset: ->
      @tsByKey = {}
      @keys = []

    get: (key) ->
      @tsByKey[key]

    getMostRecent: ->
      @keys[0]

    put: (key, ts) ->
      @del(key) if @has(key)
      @tsByKey[key] = ts
      @keys.unshift(key)

    del: (key) ->
      if @has(key)
        ts = @tsByKey[key]
        delete @tsByKey[key]
        @keys.splice(@keys.indexOf(key), 1)

    has: (key) ->
      @tsByKey.hasOwnProperty(key)

    each: (fn) ->
      fn(key, @tsByKey[key]) for key in @keys

  # KeyTracker lets you track certain keys and then ask if those keys are
  # currently being pressed.
  #
  # This fits into the keyboard class. To actually add a KeyTracker to the
  # current process you must do this:
  #
  #   keys = [...]
  #   keyTracker = keyboard.KeyTracker.create(keys)
  #   keyboard.addKeyTracker(keyTracker)
  #
  # To then check whether a tracked key is being pressed, you can say this
  # anywhere in the process:
  #
  #   keyboard.isTrackedKeyPressed('KEY_UP')
  #
  # A KeyTracker is most useful if there is a chance that some of the given keys
  # may be pressed simultaneously and yet the desired behavior is that the last
  # key pressed overrides any other keys being pressed. (Arrow keys for movement
  # is a good example.) If you are in an event such as mousedown or mouseup and
  # you want to know whether a key is being pressed, then you can simply use
  # keyboard.isKeyPressed(evt).
  #
  KeyTracker = meta.def
    KEY_TIMEOUT: 500

    init: (keyCodes) ->
      @trackedKeys = $.v.reduce(keyCodes, ((o, c) -> o[c] = 1; o), {})
      @pressedKeys = PressedKeys.create()

    reset: ->
      @pressedKeys.reset()
      return this

    keydown: (keyCode, ts) ->
      if @trackedKeys.hasOwnProperty(keyCode)
        @pressedKeys.put(keyCode, ts)
        return true
      return false

    keyup: (keyCode) ->
      if @trackedKeys.hasOwnProperty(keyCode)
        @pressedKeys.del(keyCode)
        return true
      return false

    isKeyPressed: (keyCodes...) ->
      !!$.v.find(keyCodes, (keyCode) => @pressedKeys.has(keyCode))

    clearStuckKeys: (now) ->
      @pressedKeys.each (key, ts) =>
        if (now - ts) >= KEY_TIMEOUT
          @pressedKeys.del(key)

    getLastPressedKey: ->
      @pressedKeys.getMostRecent()

  keyboard = meta.def \
    eventable,

    KeyTracker: KeyTracker
    keys: KEYS
    modifierKeys: MODIFIER_KEYS
    keyTrackers: []

    reset: ->
      keyTracker.reset() for keyTracker in @keyTrackers if @keyTrackers
      return this

    addEvents: ->
      self = this

      @bindEvents document,
        keydown: (event) ->
          key = event.keyCode
          # console.log "keydown #{key} #{++_id}"
          # Keep track of which keys are being held down at any given time
          # unless self.pressedKeys.has(key)
          #   self.pressedKeys.put(key, (new Date()).getTime())
          isTracked = false
          for keyTracker in self.keyTrackers
            if keyTracker.keydown(key, event.timeStamp)
              isTracked = true
          if isTracked
            event.preventDefault()
            return false

        keyup: (event) ->
          key = event.keyCode
          isTracked = false
          for keyTracker in self.keyTrackers
            if keyTracker.keyup(key)
              isTracked = true
          if isTracked
            event.preventDefault()
            return false

      @bindEvents window,
        blur: (event) ->
          self.reset()

      return this

    removeEvents: ->
      @unbindEvents document, 'keydown', 'keyup'
      @unbindEvents window, 'blur'
      return this

    addKeyTracker: (tracker) ->
      @keyTrackers.push(tracker)
      return this

    removeKeyTracker: (tracker) ->
      # seriously, Javascript, how am I supposed to live without a delete method
      @keyTrackers.splice @keyTrackers.indexOf(tracker), 1
      return this

    # Public: Determine whether the given event (which is expected to have a
    # valid keyCode property) refers to the given key or keys.
    #
    # keys - Integers that are key codes, or Strings that map to key codes in
    #        the KEYS hash. (Technically, what @keyCodeFor accepts.)
    #
    # Examples:
    #
    #   isKeyPressed(evt, 37)  # left arrow key
    #   isKeyPressed(evt, 'KEY_LEFT')
    #   isKeyPressed(evt, 'left', 'a')
    #
    # Returns true or false.
    #
    # Raises an Error if any of `keys` are not known keys.
    #
    # This is also aliased to #isKeyUnpressed.
    #
    isKeyPressed: (evt, keys...) ->
      $.includes @keyCodesFor(keys), evt.keyCode

    # Public: Determine whether a key or keys which are being tracked using
    # a KeyTracker are being pressed.
    #
    # keys - Integers that are key codes, or Strings that map to key codes in
    #        the KEYS hash. (Technically, what @keyCodeFor accepts.)
    #
    # Examples:
    #
    #   isTrackedKeyPressed(37)  # left arrow key
    #   isTrackedKeyPressed('KEY_LEFT')
    #   isTrackedKeyPressed('left', 'a')
    #
    # Returns true or false.
    #
    # Raises an Error if any of `keys` are not known keys.
    #
    isTrackedKeyPressed: (keys...) ->
      !!$.v.find @keyTrackers, (tracker) =>
        tracker.isKeyPressed @keyCodesFor(keyCodes)

    clearStuckKeys: (now) ->
      tracker.clearStuckKeys(now) for tracker in @keyTrackers
      return this

    modifierKeyPressed: (event) ->
      event.shiftKey or event.ctrlKey or event.altKey or event.metaKey

    keyCodesFor: (keys) ->
      (@keyCodeFor(key) for key in $.flatten(keys))

    # Public: Convert the given value into a key code (the same thing that
    # event.keyCode would return).
    #
    # key - A String name of an exact key in the KEYS hash, or a String that
    #       omits the "KEY_" part of the KEYS key, or an Integer key code.
    #
    # Examples:
    #
    #   keyCodeFor(38)        #=> 38
    #   keyCodeFor('KEY_UP')  #=> 38
    #   keyCodeFor('up')      #=> 38
    #
    # Returns an Integer.
    #
    # Raises an Error if `key` does not refer to a known key.
    #
    keyCodeFor: (key) ->
      givenKey = key
      if typeof key is 'string'
        key = "KEY_#{key.toUpperCase()}" unless /^KEY_/.test(key)
        keyCode = KEYS[key]
        unless keyCode
          throw new Error "'#{givenKey}' is not a known key. Known keys are: #{$.v.keys(KEYS).join(", ")}"
        return keyCode
      else
        return key

  keyboard.isKeyUnpressed = keyboard.isKeyPressed

  return keyboard
