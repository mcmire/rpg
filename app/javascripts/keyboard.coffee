g = window.game ||= {}

KEYS =
  KEY_TAB: 9
  KEY_ESC: 27
  KEY_SHIFT: 16
  KEY_CTRL: 17
  KEY_ALT: 18
  KEY_META: 91
  KEY_UP: 38
  KEY_DOWN: 40
  KEY_LEFT: 37
  KEY_RIGHT: 39
  KEY_W: 87
  KEY_A: 65
  KEY_S: 83
  KEY_D: 68
  KEY_H: 72
  KEY_J: 74
  KEY_K: 75
  KEY_L: 76

MODIFIER_KEYS = [
  KEYS.KEY_SHIFT
  KEYS.KEY_CTRL
  KEYS.KEY_ALT
  KEYS.KEY_META
]

PressedKeys = g.Class.extend
  reset: ->
    @tsByKey = {}
    @keys = []

  get: (key) ->
    @tsByKey[key]

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

KeyTracker = g.Class.extend
  init: (keyCodes) ->
    @trackedKeys = $.reduce keyCodes, ((o, c) -> o[c] = 1; o), {}
    @pressedKeys = new PressedKeys()

  reset: ->
    @pressedKeys.reset()

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

  isKeyPressed: (keys...) ->
    for key in $.flatten(keys)
      keyCode = keyboard.keyCodeFor(key)
      return true if self.pressedKeys.has(keyCode)
    return false

  clearStuckKeys: (now) ->
    self = this
    @pressedKeys.each (key, ts) ->
      if (now - ts) >= 500
        self.pressedKeys.del(key)

  getLastPressedKey: ->
    @pressedKeys.keys[0]

keyboard = g.module 'game.keyboard', g.eventable,
  KeyTracker: KeyTracker
  keys: KEYS
  modifierKeys: MODIFIER_KEYS

  init: ->
    @keyTrackers = []
    # @debugTimer = new Date()
    return this

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

  trapKeys: (keys...) ->
    keys = $.ensureArray(keys)
    for key in keys
      key = KEYS[key] if typeof key is 'string'
      @trappedKeys[key] = 1
    return this

  releaseKeys: (keys...) ->
    keys = $.ensureArray(keys)
    for key in keys
      key = KEYS[key] if typeof key is 'string'
      delete @trappedKeys[key]
    return this

  # Public: Determine whether a key or keys are being pressed.
  #
  # keys - Numbers that are key codes, or strings that map to key codes in the
  #        KEYS hash.
  #
  # Examples:
  #
  #   isKeyPressed(37)  # left arrow key
  #   isKeyPressed('KEY_LEFT')
  #   isKeyPressed('KEY_LEFT', 'KEY_A')
  #
  # Returns true if any of the given keys are being held down currently, or false
  # otherwise.
  #
  isKeyPressed: (keys...) ->
    return true if tracker.isKeyPressed(keys) for tracker in @keyTrackers
    return false

  clearStuckKeys: (now) ->
    tracker.clearStuckKeys(now) for tracker in @keyTrackers
    return this

  modifierKeyPressed: (event) ->
    event.shiftKey or event.ctrlKey or event.altKey or event.metaKey

  keyCodesFor: (keys...) ->
    keys = $.ensureArray(keys)
    $.map keys, (key) -> keyboard.keyCodeFor(key)

  keyCodeFor: (key) ->
    if typeof key is 'string'
      keyCode = KEYS[key]
      throw new Error("'#{arg}' is not a valid key") unless keyCode
      return keyCode
    else
      return key

g.keyboard = keyboard
