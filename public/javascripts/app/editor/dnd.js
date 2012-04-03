(function() {

  define('editor.dnd', function() {
    return {
      startDraggingWith: function(dragObject) {
        this.dragObject = dragObject;
      },
      stopDragging: function() {
        return this.dragObject = null;
      }
    };
  });

}).call(this);
