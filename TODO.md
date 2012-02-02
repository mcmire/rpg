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

* Does the position of stuff on the map reset when the map area is changed?
  i.e. the bounds.onMap for grobs - are they local to a map area or to the
  entire map? I would almost say they're local to a map area - the only reason
  we have bounds.onMap is to know whether the player's stepped outside of it.
  But we can tell that if there are no more map areas in the direction the
  player is going. Then again... if an enemy is moving around in another area of
  the map, the game should know about this? Or maybe not - maybe that's not how
  the real game calculates stuff, maybe it only cares about entities that are
  within the map area. So in that sense you don't have one big map, just a bunch
  of related maps.

* A map should be responsible for init'ing the background and foreground layers,
  except for the player which is already technically initted, just needs to be
  hooked into the foreground

* Both the outside (lightworld/darkworld) map and inside (castle) maps have
  sections, however they work differently. For the outside map, if the player
  moves to the edge of an area (outside of the viewport), then the map scrolls
  to a different area. The player cannot move outside of the viewport when
  inside a castle because there are walls, however he can move to a different
  area by walking through a door, in which case there's a fade effect as Link
  walks through the door and then an appear effect while Link walks out of the
  door on the other side. Additionally, when the player moves from inside to
  outside or outside to inside, a circle effect plays (masking the entire
  viewport).

  The point is that the outside and inside maps handle events differently.
  Perhaps when loading the inside map, events are attached to the viewport such
  that colliding with a side prompts scrolling (if necessary). When the map is
  unloaded then these events are removed.

  That sounds good to me!

* Basically we will have three canvases. One is for the foreground, one is for
  the background, and sandwiched in between will be an effects layer -- for
  making fadeouts and fadeins. This is really only for going from inside to
  outside -- for switching to an outside submap, we will append the submap being
  scrolled to to the current canvas (acting as a background to the viewport)
  and then animate the background-offset (??)

* w.r.t. create vs init, I like to think create is a constructor/cloner -- it's
  responsible for simply the act of making an object from another, with perhaps
  some additional data --  but init actually binds the instance to some other
  instance

* Hmm... maybe it'd work better if the outside map *were* one giant map... you
  might still have 64 images but you'd keep the state of the entire map in
  memory... so like when leaving an area, keep the area initialized but just
  don't draw it... effectively everything on that map is "frozen"

* Maybe rendering the outside map looks like this:

           composite
           /      \
          /        \
    background   foreground

  But then when switching to another map it goes like this

                  ---- composite3 ----
                 /                    \
                /                      \
           composite                composite2
           /      \                  /      \
          /        \                /        \
    background   foreground  background2   foreground2

  So map1's tick loop is stopped, map2 is created and drawn once, a composite of
  map1 and map2's composite canvases is created and that becomes the current
  background, the background is scrolled over to show the new map, and then the
  background changes to map2 composite and map2's tick loop is started.

  ---- Eh, on second thought, that's a bit complicated

---

* Need to figure out how to transition from outside to inside -- who does this?
* Need to add collision layer to Foreground -- since it knows about foreground
  elements and since all of those elements are collidable it instantly has
  everything it needs -- just need to add an iterator that excludes the grob in
  question
X Need to ensure that the player movement code works with the new map stuff
X Same for enemy, and grob in general
X init functions in prototypes that also have a create function - should we
  rename them to bind?
* Place the player somewhere on the map when loading it (for instance, if the
  player just walked out of a door, they need to placed in front of the door)
* Sprite may not work, don't know for sure - it at least doesn't implement
  frameDelay
* Decide if _super is really a good idea for mixins (seems really confusing)
X Add a global `images` array for loading images for mobs and the map.
* Modify Sprite to use the cached Image object from the images hash
* This means that a map background will be made up of tiles and sprites
  (non-animated and animated images). The non-animated part of the background
  will be stitched together at map load time into one canvas, and then the
  animated images will be drawn repeatedly onto the canvas per tick. So modify
  lightworld.coffee to make this canvas.
* The 'lightworld' object isn't really a map, and that bothers me. When core
  says "load map", then it should require a file that returns an instance of
  Map. In fact MapGroup should probably go away.
