(function() {
  var game;
  game = window.game || (window.game = {});
  game.Main = {
    init: function() {
      this.reset();
      return this;
    },
    destroy: function() {
      this.removeEvents();
      Keyboard.destroy();
      this.reset();
      this.detach();
      return this;
    },
    reset: function() {
      return this;
    },
    addEvents: function() {
      this.viewport.addEvents();
      return this;
    },
    removeEvents: function() {
      this.viewport.removeEvents();
      return this;
    },
    attachTo: function(wrapper) {
      $(wrapper).text("It works!");
      return this;
    },
    detach: function() {
      this.$container.detach();
      return this;
    }
  };
}).call(this);
