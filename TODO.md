# TODO

* Do not attempt to draw entities which are off the screen (out of the viewport)

* Fix sprites for the player and the enemy

* CollisionLayer: Instead of a @collisionBoxes array, store @collisionBoxesByX
  and @collisionBoxesByY arrays. These are arrays sorted by x1 and y1, and as
  the player moves through the world and crosses X and Y coordinates of boxes,
  pointers would be updated which point to boxes in the two arrays. So we have
  pointers that point to the last boxes that the player has crossed (in the X
  and Y directions). Since the collision box arrays are sorted, the next box
  that the player reaches will be next in the array after the pointer, so we
  don't have to search the entire array every time.

* Use Rack middleware for compiling Coffee and Sass on the fly
  (performance is not important for this app)

* Add a Grob class which accepts a Bounds and implements #predraw, #draw and
  #postdraw - #predraw will clear the last drawn Bounds and #postdraw will store
  it? - it also has @bounds.onMap which knows how to convert itself to
  @bounds.onViewport - also it has @isLoaded and a load() method

* fpsReporter and the like should be "plugins" to main... that way if we want to
  disable it we shouldn't have to remember where all to comment out stuff

* Maybe change Bounds so that it contains bounds-on-map and bounds-on-viewport
  and knows how to recalculate itself? Or should it be a Grob... in that case
  Grob would have the ability to draw itself and move itself... and keep track
  of bounds-on-map and bounds-on-viewport... Then a Mob incorporates the idea of
  sprites/images, and instead of bom and bov it has bounds and then a fence,
  where bounds and fence are themselves Grobs... so that begs the question, does
  Grob also do collision (i.e. does it have a @box which uses @bounds.onMap and
  then keeps its own version of @collisionLayer.collisionBoxes)?

  mob
  - bounds (Grob)
    - onMap
    - inViewport
    - box
    - collisionBoxes
  - fence (Grob)
    - onMap
    - inViewport
    - box
    - collisionBoxes

  Yeah that doesn't seem right, does it...

  It really seems we have more of the idea of roles or traits here:

  * Drawable: Implements #predraw, #draw (which will just draw a box) and
    #postdraw, and keeps @bounds and @lastBounds -- @lastBounds will
    automatically be cleared after each draw
  * Spritable: Keeps track of states and can set the current state and
    transition to another state, #draw draws an image rather than a box, #load
    loads the image and sets @isLoaded = true
    when loaded, #postdraw
  * Movable: Has methods for moving the viewport and map bounds simultaneously
    (obviously assumes both viewport and map bounds are present)
  * Collidable: Has @box and @collisionBoxes properties

  Grobs (née Mobs) have all four traits, CollisionBoxes (ones associated with
  the map) are both Collidable and potentially Drawable, and Bounds are just
  Drawable. I guess the Drawable stuff is the only potential thing that's
  shared, the rest is Grob/Mob. But then again it doesn't make sense that a
  Bounds is Drawable because in order to draw bounds you have to have access to
  the main.canvas.ctx. Which is possible anywhere of course, but not if you want
  to keep a strict object reference. So in order to draw a plain Bounds, you
  have to 1) have a 'main' reference somewhere and 2) use that to stuff it into
  a Grob instance. So what if we want to suddenly draw all of the collision
  boxes? Does that mean that CollisionBoxes suddenly have to be Grobs? That
  seems a bit excessive, but maybe that makes sense -- especially if all Bounds
  keep track of both map-bounds and viewport-bounds. Or at least if we were
  passing this "ComboBounds" to CollisionBox rather than just straight Bounds.
  (All Bounds cannot support both, because of the player fence, which only needs
  to be a box situated in the viewport.)

* Change the array of collision boxes so that we store grobs. In fact use the
  grobs as the things over which to iterate when determining collision -- i.e.
  just give this array initialized in main to collisionLayer. An item in the
  array represents either a Mob (like the player, or an enemy) or a collidable
  box on the map (a MapBlock). All of these are Grobs and all have a @box
  property which wraps the bounds-on-map (wherever they are in the object) in a
  consistent API (CollidableBox), and provides some convenience methods to
  determine intersection.

* Traits:

  * pluggable (addPlugin, removePlugin)
  * eventable (addEvents, removeEvents, bindEvents, unbindEvents) [ incorporates eventHelpers]
  * attachable (attachTo, detach)
  * tickable (tick)
  * drawable (predraw, draw, postdraw) [ implies tickable ]
  * runnable (start, stop, suspend, resume)
  * loadable (load, isLoaded)

* Ideas for traits, if more than one thing used them:

  * spriteable (states, setState, state, ...)
  * collidable (box, allCollisionBoxes)
  * mappable (bounds.onMap, bounds.onViewport)

* Traits should be able to be mixed into both modules and classes (traits are
  just modules). Modules and classes should know which traits they support: when
  a trait is added to a class or module, the name of the trait module is stored
  in a class-level 'traits' array. You should be able to know whether a module
  supports a trait by asking `module.does('trait_name')`. Similarly, you should
  be able to know this for a class by asking `klass.does('trait_name')`, and
  this should also work for class instances: `obj.does('trait_name')`. Or if
  that doesn't look right, then you could say `obj.doesSupport(trait_module)`
  and all it would do is check that the methods in the trait module exist.
