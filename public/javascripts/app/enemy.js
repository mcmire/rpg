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
      duration: 24,
      then: 'moveRight'
    });

    Enemy.addState('downToLeft', {
      frames: [0, 3],
      duration: 24,
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
      duration: 24,
      then: 'moveUp'
    });

    Enemy.addState('rightToDown', {
      frames: [4, 7],
      duration: 24,
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
      duration: 24,
      then: 'moveDown'
    });

    Enemy.addState('leftToUp', {
      frames: [8, 11],
      duration: 24,
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
      duration: 24,
      then: 'moveLeft'
    });

    Enemy.addState('upToRight', {
      frames: [12, 15],
      duration: 24,
      then: 'moveRight'
    });

    function Enemy() {
      Enemy.__super__.constructor.apply(this, arguments);
      this.setState('moveRight');
      this._directionChangeNeeded = false;
      this._chooseSequenceLength();
    }

    Enemy.prototype.initFence = function() {
      return this.bounds.fenceOnMap = Bounds.fromDims(300, 300, 100, 100);
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
      while (this.collisionLayerBoxes.intersectsWith(this.bounds.onMap)) {
        _results.push(fn());
      }
      return _results;
    };

    Enemy.prototype.moveLeft = function() {
      var nextBoundsOnMap, x;
      this.direction = 'left';
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        x: -this.speed
      });
      if ((x = this.collisionLayerBoxes.getOuterRightEdgeBlocking(nextBoundsOnMap)) || (x = this.bounds.fenceOnMap.getInnerLeftEdgeBlocking(nextBoundsOnMap))) {
        this.bounds.onMap.translateBySide('x1', x);
        return this._directionChangeNeeded = true;
      } else {
        return this.bounds.onMap.replace(nextBoundsOnMap);
      }
    };

    Enemy.prototype.moveRight = function() {
      var nextBoundsOnMap, x;
      this.direction = 'right';
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        x: +this.speed
      });
      if ((x = this.collisionLayerBoxes.getOuterLeftEdgeBlocking(nextBoundsOnMap)) || (x = this.bounds.fenceOnMap.getInnerRightEdgeBlocking(nextBoundsOnMap))) {
        this.bounds.onMap.translateBySide('x2', x);
        return this._directionChangeNeeded = true;
      } else {
        return this.bounds.onMap.replace(nextBoundsOnMap);
      }
    };

    Enemy.prototype.moveUp = function() {
      var nextBoundsOnMap, y;
      this.direction = 'up';
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        y: -this.speed
      });
      if ((y = this.collisionLayerBoxes.getOuterBottomEdgeBlocking(nextBoundsOnMap)) || (y = this.bounds.fenceOnMap.getInnerTopEdgeBlocking(nextBoundsOnMap))) {
        this.bounds.onMap.translateBySide('y1', y);
        return this._directionChangeNeeded = true;
      } else {
        return this.bounds.onMap.replace(nextBoundsOnMap);
      }
    };

    Enemy.prototype.moveDown = function() {
      var nextBoundsOnMap, y;
      this.direction = 'down';
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        y: +this.speed
      });
      if ((y = this.collisionLayerBoxes.getOuterTopEdgeBlocking(nextBoundsOnMap)) || (y = this.bounds.fenceOnMap.getInnerBottomEdgeBlocking(nextBoundsOnMap))) {
        this.bounds.onMap.translateBySide('y2', y);
        return this._directionChangeNeeded = true;
      } else {
        return this.bounds.onMap.replace(nextBoundsOnMap);
      }
    };

    Enemy.prototype.postdraw = function() {
      if (this._directionChangeNeeded || this.numSeqFrameDraws === this.sequenceLength) {
        this._directionChangeNeeded = false;
        return this._chooseAnotherDirection();
      } else {
        return Enemy.__super__.postdraw.apply(this, arguments);
      }
    };

    Enemy.prototype._chooseAnotherDirection = function() {
      var direction, validDirections;
      validDirections = (function() {
        switch (this.direction) {
          case 'up':
          case 'down':
            return ['left', 'right'];
          case 'left':
          case 'right':
            return ['up', 'down'];
        }
      }).call(this);
      direction = $.capitalize($.randomItem(validDirections));
      this.setState("" + this.direction + "To" + direction);
      return this._chooseSequenceLength();
    };

    Enemy.prototype._chooseSequenceLength = function() {
      return this.sequenceLength = $.randomInt(40, 80);
    };

    return Enemy;

  })(Mob);

}).call(this);
