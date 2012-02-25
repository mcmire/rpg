(function() {

  Array.prototype["delete"] = function(value) {
    return this.deleteAt(this.indexOf(value));
  };

  Array.prototype.deleteAt = function(index) {
    return this.splice(index, 1);
  };

  window.scriptLoaded('app/ext');

}).call(this);
