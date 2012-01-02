(function() {
  var Bounds, DIRECTIONS, Mob, SpriteSheet, game, _ref,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  _ref = game = window.game, Bounds = _ref.Bounds, Mob = _ref.Mob, SpriteSheet = _ref.SpriteSheet;

  DIRECTIONS = 'right down left up'.split(' ');

  game.Enemy = (function(_super) {

    __extends(Enemy, _super);

    Enemy.extended();

    Enemy.image = 'enemy2x.gif';

    Enemy.width = 40;

    Enemy.height = 56;

    Enemy.speed = 3;

    Enemy.addState('moveDown', {
      frames: [0, 1],
      duration: 4,
      repeat: true,
      move: true
    });

    Enemy.addState('downToRight', {
      frames: [0, 2],
      duration: 16,
      then: 'moveRight'
    });

    Enemy.addState('downToLeft', {
      frames: [0, 3],
      duration: 16,
      then: 'moveLeft'
    });

    Enemy.addState('moveRight', {
      frames: [4, 5],
      duration: 4,
      repeat: true,
      move: true
    });

    Enemy.addState('rightToUp', {
      frames: [4, 6],
      duration: 16,
      then: 'moveUp'
    });

    Enemy.addState('rightToDown', {
      frames: [4, 7],
      duration: 16,
      then: 'moveDown'
    });

    Enemy.addState('moveLeft', {
      frames: [8, 9],
      duration: 4,
      repeat: true,
      move: true
    });

    Enemy.addState('leftToDown', {
      frames: [8, 10],
      duration: 16,
      then: 'moveDown'
    });

    Enemy.addState('leftToUp', {
      frames: [8, 11],
      duration: 16,
      then: 'moveUp'
    });

    Enemy.addState('moveUp', {
      frames: [12, 13],
      duration: 4,
      repeat: true,
      move: true
    });

    Enemy.addState('upToLeft', {
      frames: [12, 14],
      duration: 16,
      then: 'moveLeft'
    });

    Enemy.addState('upToRight', {
      frames: [12, 15],
      duration: 16,
      then: 'moveRight'
    });

    function Enemy() {
      Enemy.__super__.constructor.apply(this, arguments);
      this.setState('moveRight');
    }

    Enemy.prototype.initFence = function() {
      return this.bounds.fenceOnMap = new Bounds(200, 200, 100, 100);
    };

    Enemy.prototype.initTopLeftBoundsOnMap = function() {
      var fn, self, _results;
      self = this;
      fn = function() {
        var x1, y1;
        x1 = $.randomInt(self.bounds.fenceOnMap.x1, self.bounds.fenceOnMap.x2);
        y1 = $.randomInt(self.bounds.fenceOnMap.y1, self.bounds.fenceOnMap.y2);
        return self.bounds.onMap.anchor(x1, y1);
      };
      fn();
      _results = [];
      while (this.collisionLayer.isIntersection(this.bounds.onMap)) {
        _results.push(fn());
      }
      return _results;
    };

    Enemy.prototype.postdraw = function() {
      var i, nextDirection;
      Enemy.__super__.postdraw.apply(this, arguments);
      if (this.state.doesMove && this.numFramesDrawn > 20) {
        i = (DIRECTIONS.indexOf(this.direction) + 1) % DIRECTIONS.length;
        nextDirection = $.capitalize(DIRECTIONS[i]);
        return this.setState("" + this.direction + "To" + nextDirection);
      }
    };

    Enemy.prototype.moveUp = function() {
      this.direction = 'up';
      return this.bounds.onMap.translate({
        y: -this.speed
      });
    };

    Enemy.prototype.moveDown = function() {
      this.direction = 'down';
      return this.bounds.onMap.translate({
        y: +this.speed
      });
    };

    Enemy.prototype.moveLeft = function() {
      this.direction = 'left';
      return this.bounds.onMap.translate({
        x: -this.speed
      });
    };

    Enemy.prototype.moveRight = function() {
      this.direction = 'right';
      return this.bounds.onMap.translate({
        x: +this.speed
      });
    };

    Enemy.prototype._chooseValidDirectionFrom = function(directions) {
      var validDirections;
      validDirections = $.every(directions, function(dir) {
        return !!this._nextValidMove(dir);
      });
      return $.randomItem(validDirections);
    };

    Enemy.prototype._move = function(direction) {
      var axis, dx, dy, _ref2;
      _ref2 = [0, 0], dx = _ref2[0], dy = _ref2[1];
      switch (direction) {
        case 'right':
          axis = 'x';
          dx = +this.speed;
          break;
        case 'left':
          axis = 'x';
          dx = -this.speed;
          break;
        case 'up':
          axis = 'y';
          dy = -this.speed;
          break;
        case 'down':
          axis = 'y';
          dy = +this.speed;
      }
      this.bounds.onMap.withTranslation({
        x: dx,
        y: dy
      });
      return this.spriteSheet.useSequence("move_" + direction);
    };

    Enemy.prototype._nextValidMove = function(direction) {
      var axis, dx, dy, nextBoundsOnMap, offset, _ref2;
      _ref2 = [0, 0], dx = _ref2[0], dy = _ref2[1];
      switch (direction) {
        case 'right':
          axis = 'x';
          dx = +this.speed;
          break;
        case 'left':
          axis = 'x';
          dx = -this.speed;
          break;
        case 'up':
          axis = 'y';
          dy = -this.speed;
          break;
        case 'down':
          axis = 'y';
          dy = +this.speed;
      }
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        x: dx,
        y: dy
      });
      offset = this.collisionLayer.offsetToNotCollide(direction, nextBoundsOnMap) || this.bounds.onMap.offsetToKeepInside(direction, nextBoundsOnMap);
      return nextBoundsOnMap.withTranslation(axis, -offset);
    };

    Enemy.prototype._transitionTo = function(direction) {
      return this.spriteSheet.useSequence("" + this.direction + "-to-" + direction);
    };

    Enemy.prototype._outsideBoundsOnMap = function(bounds) {
      return bounds.x1 < this.bounds.onMap.x1 || bounds.x2 > this.bounds.onMap.x2 || bounds.y1 < this.bounds.onMap.y1 || bounds.y2 > this.bounds.onMap.y2;
    };

    return Enemy;

  })(Mob);

}).call(this);
