(function() {
  var __slice = Array.prototype.slice;

  define('editor.DropTarget', function() {
    var DropTarget, EVT_NS, dnd, enderMethods, meta;
    meta = require('meta');
    dnd = require('editor.dnd');
    EVT_NS = 'dnd.dropTarget';
    DropTarget = meta.def({
      init: function(sensor, options) {
        var offset,
          _this = this;
        if (options == null) options = {};
        this.$sensor = $(sensor);
        this.options = options;
        this.$receptor = options.receptor ? $(options.receptor) : this.$sensor;
        if (!this.$sensor.length) {
          throw new Error("DropTarget#init: sensor element doesn't exist");
        }
        if (!this.$receptor.length) {
          throw new Error("DropTarget#init: receptor element doesn't exist");
        }
        offset = this.$sensor.offset();
        this.x1 = offset.left;
        this.x2 = offset.left + offset.width;
        this.y1 = offset.top;
        this.y2 = offset.top + offset.height;
        return this.$sensor.bind("dropopen." + EVT_NS, function(evt) {
          var $dragHelper, $dragOwner, $draggee, dragObject, lastMouseLocation, mouseenterFired, mouseleaveFired;
          _this._logEvent(_this.$sensor, 'sensor dropopen');
          $dragOwner = $(evt.relatedTarget);
          dragObject = $dragOwner.data('dragObject');
          $draggee = dragObject.getDraggee();
          $dragHelper = dragObject.getHelper();
          _this.$sensor.one("mouseup." + EVT_NS, function(evt) {
            _this._logEvent(_this.$sensor, 'elem mouseup');
            evt.relatedTarget = $draggee[0];
            evt.relatedObject = dragObject;
            _this.$sensor.trigger("mousedropwithin", evt);
            return $dragOwner.trigger("mousedrop", evt);
          });
          if (_this._mouseWithinSensor(evt)) {
            dragObject.setInsideDropTarget();
            $(window).bind("mousemove." + EVT_NS, function(evt) {
              if (_this._mouseWithinSensor(evt)) {
                return _this.$sensor.trigger("mousedragwithin", evt);
              }
            });
            return;
          }
          lastMouseLocation = null;
          mouseenterFired = false;
          mouseleaveFired = false;
          dragObject.setOutsideDropTarget();
          $(window).bind("mousemove." + EVT_NS, function(evt) {
            if (_this._mouseWithinSensor(evt)) {
              if (lastMouseLocation === 'outside' && !mouseenterFired) {
                mouseenterFired = true;
                $dragOwner.trigger("mousedropover", evt);
                _this.$sensor.trigger("mousedragover", evt);
              }
              lastMouseLocation = 'inside';
              return _this.$sensor.trigger("mousedragwithin", evt);
            } else {
              if (lastMouseLocation === 'inside' && mouseenterFired && !mouseleaveFired) {
                mouseleaveFired = true;
                _this.$sensor.trigger("mousedragout", evt);
                $dragOwner.trigger("mousedropout", evt);
              }
              return lastMouseLocation = 'outside';
            }
          });
          return _this.$sensor.bind("mousedragover." + EVT_NS, function(evt) {
            _this._logEvent(_this.$sensor, 'elem mousedragover');
            _this.$receptor.append($draggee);
            dragObject.setInsideDropTarget();
            return dragObject.position(evt);
          }).one("mousedragout." + EVT_NS, function(evt) {
            _this._logEvent(_this.$sensor, 'elem mousedragout');
            dragObject.setOutsideDropTarget();
            return $draggee.detach();
          }).one("dropclose." + EVT_NS, function(evt) {
            _this._logEvent(_this.$sensor, 'sensor dropclose');
            $(window).unbind("mousemove." + EVT_NS);
            return _this.$sensor.unbind("mousedragover." + EVT_NS);
          });
        });
      },
      destroy: function() {
        this.$sensor.unbind("." + EVT_NS);
        return $(window).unbind("." + EVT_NS);
      },
      getSensor: function() {
        return this.$sensor;
      },
      getReceptor: function() {
        return this.$receptor;
      },
      _mouseWithinSensor: function(evt) {
        var _ref, _ref2;
        return (this.x1 <= (_ref = evt.pageX) && _ref <= this.x2) && (this.y1 <= (_ref2 = evt.pageY) && _ref2 <= this.y2);
      },
      _logEvent: function() {
        var $elem, args, msg, name, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _ref = args.reverse(), name = _ref[0], $elem = _ref[1];
        msg = "" + EVT_NS + ": " + name;
        if ($elem) msg += " (#" + ($elem.data('node-uid')) + ")";
        return console.log(msg);
      }
    });
    enderMethods = {
      dropTarget: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.each(function() {
          var $this, dropTarget, method, options;
          $this = $(this);
          dropTarget = $this.data('dropTarget');
          if (!dropTarget) {
            options = args[0] || {};
            if (options && !$.v.is.obj(options)) {
              throw new Error("Usage: $(...).dropTarget([options])");
            }
            dropTarget = DropTarget.create(this, options);
            $this.data('dropTarget', dropTarget);
          }
          if (typeof args[0] === 'string') {
            method = args.shift();
            if (typeof dropTarget[method] === 'function') {
              dropTarget[method].apply(dropTarget, args);
            }
            if (method === 'destroy') return $this.data('dropTarget', null);
          }
        });
      }
    };
    $.ender(enderMethods, true);
    return DropTarget;
  });

}).call(this);
