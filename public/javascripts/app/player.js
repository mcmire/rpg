(function() {
  var DIRECTIONS, DIRECTION_KEYS, KEYS, KEY_DIRECTIONS, Mob, Player, SpriteSheet, dir, game, keyCode, keyboard, _i, _j, _len, _len2, _ref, _ref2,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  _ref = game = window.game, keyboard = _ref.keyboard, Mob = _ref.Mob, SpriteSheet = _ref.SpriteSheet;

  DIRECTIONS = 'up down left right'.split(' ');

  DIRECTION_KEYS = {
    up: keyboard.keyCodesFor('KEY_W', 'KEY_UP', 'KEY_K'),
    down: keyboard.keyCodesFor('KEY_S', 'KEY_DOWN', 'KEY_J'),
    left: keyboard.keyCodesFor('KEY_A', 'KEY_LEFT', 'KEY_H'),
    right: keyboard.keyCodesFor('KEY_D', 'KEY_RIGHT', 'KEY_L')
  };

  KEY_DIRECTIONS = {};

  for (_i = 0, _len = DIRECTIONS.length; _i < _len; _i++) {
    dir = DIRECTIONS[_i];
    _ref2 = DIRECTION_KEYS[dir];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      keyCode = _ref2[_j];
      KEY_DIRECTIONS[keyCode] = dir;
    }
  }

  KEYS = $.flatten($.values(DIRECTION_KEYS));

  Player = (function(_super) {

    __extends(Player, _super);

    Player.extended();

    Player.image = 'link2x.gif';

    Player.width = 34;

    Player.height = 48;

    Player.speed = 7;

    Player.addState('moveLeft', {
      duration: 4,
      frames: [0, 1, 2, 3, 4, 5, 6, 7],
      repeat: true,
      move: true
    });

    Player.addState('moveRight', {
      duration: 4,
      frames: [8, 9, 10, 11, 12, 13, 14, 15],
      repeat: true,
      move: true
    });

    Player.addState('moveDown', {
      duration: 4,
      frames: [16, 17, 18, 19, 20, 21, 22],
      repeat: true,
      move: true
    });

    Player.addState('moveUp', {
      duration: 4,
      frames: [23, 24, 25, 26, 27, 28],
      repeat: true,
      move: true
    });

    Player.addState('idleLeft', {
      duration: 4,
      frames: [0],
      repeat: true
    });

    Player.addState('idleRight', {
      duration: 4,
      frames: [8],
      repeat: true
    });

    Player.addState('idleDown', {
      duration: 4,
      frames: [19],
      repeat: true
    });

    Player.addState('idleUp', {
      duration: 4,
      frames: [23],
      repeat: true
    });

    function Player() {
      this.keyTracker = new keyboard.KeyTracker(KEYS);
      this.viewportPadding = 30;
      Player.__super__.constructor.apply(this, arguments);
      this.setState('idleRight');
    }

    Player.prototype.initFence = function() {
      return this.bounds.fenceInViewport = this.viewport.bounds.withScale(this.viewportPadding);
    };

    Player.prototype.destroy = function() {
      Player.__super__.destroy.apply(this, arguments);
      return this.removeEvents();
    };

    Player.prototype.addEvents = function() {
      Player.__super__.addEvents.apply(this, arguments);
      return keyboard.addKeyTracker(this.keyTracker);
    };

    Player.prototype.removeEvents = function() {
      Player.__super__.removeEvents.apply(this, arguments);
      return keyboard.removeKeyTracker(this.keyTracker);
    };

    Player.prototype.onAdded = function() {
      Player.__super__.onAdded.apply(this, arguments);
      return this.addEvents();
    };

    Player.prototype.predraw = function() {
      var direction, state;
      if (keyCode = this.keyTracker.getLastPressedKey()) {
        direction = KEY_DIRECTIONS[keyCode];
        state = 'move' + $.capitalize(direction);
      } else {
        state = this.state.name.replace('move', 'idle');
      }
      if (state !== this.state.name) this.setState(state);
      return Player.__super__.predraw.apply(this, arguments);
    };

    Player.prototype.moveLeft = function() {
      var distanceFromFence, fence, nextBoundsOnMap, x;
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        x: -this.speed
      });
      fence = this.bounds.fenceInViewport;
      if (x = this.collisionLayer.getBlockingRightEdge(nextBoundsOnMap)) {
        this.bounds.onMap.translateBySide('x1', x + 1);
        return;
      }
      if ((this.viewport.bounds.x1 - this.speed) < 0) {
        this.viewport.translateBySide('x1', 0);
        if (nextBoundsOnMap.x1 < 0) {
          return this.bounds.onMap.translateBySide('x1', 0);
        } else {
          return this.bounds.onMap.translate({
            x: -this.speed
          });
        }
      } else {
        this.bounds.onMap.translate({
          x: -this.speed
        });
        if ((this.bounds.inViewport.x1 - this.speed) < fence.x1) {
          distanceFromFence = this.bounds.inViewport.x1 - fence.x1;
          return this.viewport.translate({
            x: -(this.speed - distanceFromFence)
          });
        }
      }
    };

    Player.prototype.moveRight = function() {
      var distanceFromFence, fence, mapWidth, nextBoundsOnMap, x;
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        x: this.speed
      });
      fence = this.bounds.fenceInViewport;
      if (x = this.collisionLayer.getBlockingLeftEdge(nextBoundsOnMap)) {
        this.bounds.onMap.translateBySide('x2', x - 1);
        return;
      }
      mapWidth = this.map.width.pixels;
      if ((this.viewport.bounds.x2 + this.speed) > mapWidth) {
        this.viewport.translateBySide('x2', mapWidth);
        if (nextBoundsOnMap.x2 > mapWidth) {
          return this.bounds.onMap.translateBySide('x2', mapWidth);
        } else {
          return this.bounds.onMap.translate({
            x: this.speed
          });
        }
      } else {
        this.bounds.onMap.translate({
          x: this.speed
        });
        if ((this.bounds.inViewport.x2 + this.speed) > fence.x2) {
          distanceFromFence = fence.x2 - this.bounds.inViewport.x2;
          return this.viewport.translate({
            x: this.speed - distanceFromFence
          });
        }
      }
    };

    Player.prototype.moveUp = function() {
      var distanceFromFence, fence, nextBoundsOnMap, y;
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        y: -this.speed
      });
      fence = this.bounds.fenceInViewport;
      if (y = this.collisionLayer.getBlockingBottomEdge(nextBoundsOnMap)) {
        this.bounds.onMap.translateBySide('y1', y + 1);
        return;
      }
      if ((this.viewport.bounds.y1 - this.speed) < 0) {
        this.viewport.translateBySide('y1', 0);
        if (nextBoundsOnMap.y1 < 0) {
          return this.bounds.onMap.translateBySide('y1', 0);
        } else {
          return this.bounds.onMap.translate({
            y: -this.speed
          });
        }
      } else {
        this.bounds.onMap.translate({
          y: -this.speed
        });
        if ((this.bounds.inViewport.y1 - this.speed) < fence.y1) {
          distanceFromFence = this.bounds.inViewport.y1 - fence.y1;
          return this.viewport.translate({
            y: -(this.speed - distanceFromFence)
          });
        }
      }
    };

    Player.prototype.moveDown = function() {
      var distanceFromFence, fence, mapHeight, nextBoundsOnMap, y;
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        y: this.speed
      });
      fence = this.bounds.fenceInViewport;
      if (y = this.collisionLayer.getBlockingTopEdge(nextBoundsOnMap)) {
        this.translateBySide('y2', y - 1);
        return;
      }
      mapHeight = this.map.height.pixels;
      if ((this.viewport.bounds.y2 + this.speed) > mapHeight) {
        this.viewport.translateBySide('y2', mapHeight);
        if (nextBoundsOnMap.y2 > mapHeight) {
          return this.bounds.onMap.translateBySide('y2', mapHeight);
        } else {
          return this.bounds.onMap.translate({
            y: this.speed
          });
        }
      } else {
        this.bounds.onMap.translate({
          y: this.speed
        });
        if ((this.bounds.inViewport.y2 + this.speed) > fence.y2) {
          distanceFromFence = fence.y2 - this.bounds.inViewport.y2;
          return this.viewport.translate({
            y: this.speed - distanceFromFence
          });
        }
      }
    };

    return Player;

  })(Mob);

  game.Player = Player;

}).call(this);
