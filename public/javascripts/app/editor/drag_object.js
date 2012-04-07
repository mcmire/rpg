(function() {
  var __slice = Array.prototype.slice;

  define('editor.DragObject', function() {
    var DragObject, EVT_NS, dnd, enderMethods, meta;
    meta = require('meta');
    dnd = require('editor.dnd');
    EVT_NS = 'dnd.dragObject';
    DragObject = meta.def({
      init: function(elem, options) {
        var $dropTarget, that,
          _this = this;
        if (options == null) options = {};
        that = this;
        this.$elem = $(elem);
        this.$elem.addClass('editor-drag-object');
        this.offset = this.$elem.offset();
        this.options = options;
        if (options.dropTarget) {
          $dropTarget = $(options.dropTarget);
          this.dropTarget = $dropTarget.data('dropTarget');
          if (!this.dropTarget) {
            throw new Error("DragObject#init: Drop target not defined. Either the drop target doesn't exist, or you need to call $(...).dropTarget() on it.");
          }
        }
        this.dragOffset = null;
        return this.$elem.bind("mousedown." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'elem mousedown');
          if (evt.button === 2) return;
          evt.preventDefault();
          return _this._addWindowEvents();
        }).bind("mouseup." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'elem mouseup');
          if (!_this.dragStarted) return _this.$elem.trigger('mouseupnodrag', evt);
        }).bind("mousedragstart." + EVT_NS, function(evt) {
          var elemOffset;
          _this._logEvent(_this.$elem, 'elem mousedragstart');
          $(document.body).addClass('editor-drag-object-dragged');
          elemOffset = _this.$elem.offset();
          console.log("setting dragOffset on " + (_this.$elem.data('node-uid')));
          _this.dragOffset = {
            x: evt.pageX - elemOffset.left,
            y: evt.pageY - elemOffset.top
          };
          dnd.startDraggingWith(_this);
          if (_this.options.helper) {
            _this._addDragEventsWithHelper();
          } else {
            _this._addDragEventsWithoutHelper();
          }
          if (_this.dropTarget) {
            evt.relatedTarget = _this.$elem[0];
            _this.dropTarget.getSensor().trigger('dropopen', evt);
          }
          return _this.$elem.one("mousedragend." + EVT_NS, function(evt) {
            _this._logEvent(_this.$elem, 'elem mousedragend');
            $(document.body).removeClass('editor-drag-object-dragged');
            _this.dragOffset = null;
            if (_this.dropTarget) {
              evt.relatedTarget = _this.$elem[0];
              _this.dropTarget.getSensor().trigger('dropclose', evt);
            }
            dnd.stopDragging();
            if (_this.options.helper) {
              return _this._removeDragEventsWithHelper();
            } else {
              return _this._removeDragEventsWithoutHelper();
            }
          });
        });
      },
      destroy: function() {
        this.$elem.removeClass('editor-drag-object');
        this.$elem.unbind("." + EVT_NS);
        return $(window).unbind("." + EVT_NS);
      },
      position: function(evt) {
        var $elem, dropTargetOffset, x, y;
        $elem = this.options.helper ? this.$helper : this.$elem;
        if (!this.dragOffset) {
          console.log("accessing dragOffset on " + (this.$elem.data('node-uid')));
          throw new Error('dragOffset is not defined');
        }
        x = evt.pageX - this.dragOffset.x;
        y = evt.pageY - this.dragOffset.y;
        if (this.dropTarget) {
          dropTargetOffset = this.dropTarget.getReceptor().offset();
          if (this.isOverDropTarget) {
            x -= dropTargetOffset.left;
            y -= dropTargetOffset.top;
          }
          if (this.options.containWithinDropTarget) {
            if (x < 0) {
              x = 0;
            } else if ((x + this.offset.width) > dropTargetOffset.width) {
              x = dropTargetOffset.width - this.offset.width;
            }
            if (y < 0) {
              y = 0;
            } else if ((y + this.offset.height) > dropTargetOffset.height) {
              y = dropTargetOffset.height - this.offset.height;
            }
          }
        }
        return $elem.moveTo({
          x: x,
          y: y
        });
      },
      getDraggee: function() {
        if (this.options.helper) {
          return this.$helper;
        } else {
          return this.$elem;
        }
      },
      getElement: function() {
        return this.$elem;
      },
      getHelper: function() {
        return this.$helper;
      },
      setInsideDropTarget: function() {
        return this.isOverDropTarget = true;
      },
      setOutsideDropTarget: function() {
        return this.isOverDropTarget = false;
      },
      _addDragEventsWithHelper: function() {
        var _this = this;
        this.$helper = this.$elem.clone();
        this.$helper.addClass('editor-drag-helper');
        $(document.body).append(this.$helper);
        return this.$elem.one("mousedropcancel." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'helper mousedropcancel');
          _this.$helper.remove();
          return _this.$helper = null;
        }).bind("mousedropover." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'helper mousedropover');
          return _this.$helper.removeClass('editor-drag-helper').detach();
        }).bind("mousedropout." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'helper mousedropout');
          _this.$helper.addClass('editor-drag-helper');
          $(document.body).append(_this.$helper);
          return _this.position(evt);
        }).bind("mousedrag." + EVT_NS, function(evt) {
          return _this.position(evt);
        });
      },
      _removeDragEventsWithHelper: function() {
        return this.$elem.unbind(["mousedropover." + EVT_NS, "mousedropout." + EVT_NS].join(" "));
      },
      _addDragEventsWithoutHelper: function() {
        var _this = this;
        return this.$elem.bind("mousedrag." + EVT_NS, function(evt) {
          return _this.position(evt);
        });
      },
      _removeDragEventsWithoutHelper: function() {
        return this.$elem.unbind("mousedrag." + EVT_NS);
      },
      _addWindowEvents: function() {
        var _this = this;
        console.log('DragObject#_addWindowEvents called');
        this.dragStarted = false;
        this._addMousemoveEvent();
        return $(window).one("mouseup." + EVT_NS, function(evt) {
          _this._logEvent('window mouseup');
          if (_this.dragStarted) {
            _this.$elem.trigger('mousedragend', evt);
            if (!_this.isOverDropTarget) {
              _this.$elem.trigger('mousedropcancel', evt);
            }
          }
          return _this._removeWindowEvents();
        });
      },
      _addMousemoveEvent: function() {
        var _this = this;
        return $(window).bind("mousemove." + EVT_NS, function(evt) {
          if (!_this.dragStarted) {
            _this.dragStarted = true;
            _this.$elem.trigger("mousedragstart", evt);
          }
          if (_this.dragStarted) {
            return _this.$elem.trigger("mousedrag", evt);
          } else {
            return evt.preventDefault();
          }
        });
      },
      _removeMousemoveEvent: function() {
        return $(window).unbind("mousemove." + EVT_NS);
      },
      _removeWindowEvents: function() {
        console.log('DragObject#_removeWindowEvents called');
        this.dragStarted = false;
        return $(window).unbind("." + EVT_NS);
      },
      _logEvent: function() {
        var $elem, args, desc, msg, name, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _ref = args.reverse(), name = _ref[0], $elem = _ref[1];
        desc = this.options.helper ? 'map object' : 'helper';
        msg = "" + EVT_NS + ": " + name;
        if ($elem) msg += " (#" + ($elem.data('node-uid')) + ")";
        return console.log("" + msg + " (" + desc + ")");
      }
    });
    enderMethods = {
      dragObject: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.each(function() {
          var $this, dragObject, method, options;
          $this = $(this);
          dragObject = $this.data('dragObject');
          if (!dragObject) {
            options = args[0] || {};
            if (options && !$.v.is.obj(options)) {
              throw new Error("Usage: $(...).dragObject([options])");
            }
            dragObject = DragObject.create(this, options);
            $this.data('dragObject', dragObject);
          }
          if (typeof args[0] === 'string') {
            method = args[0];
            if (typeof dragObject[method] === 'function') {
              console.log("calling " + method + " on #" + ($this.data('node-uid')));
              dragObject[method](args.slice(1));
            }
            if (method === 'destroy') return $this.data('dragObject', null);
          }
        });
      }
    };
    $.ender(enderMethods, true);
    return DragObject;
  });

}).call(this);
