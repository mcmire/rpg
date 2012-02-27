(function() {

  define('common', function() {
    return {
      imagesPath: '/images',
      resolveImagePath: function(path) {
        return "" + this.imagesPath + "/" + path;
      }
    };
  });

}).call(this);
