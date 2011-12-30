# TODO

* A quick keyup, keydown of an arrow key while holding down Command will result
  in the character moving until the arrow key is keyup / keydown'ed again. It
  also happens if the arrow key is keydown'ed, Command is keydown'ed, then the
  arrow key is keyup'ed. Essentially the keyup event for the arrow key is never
  fired. (FIXED?)

* Add an enemy - most of the code is there, need to get the draw code working.
  Also make it so collisions occur between the player and the enemy.

* Fix sprites for the player and the enemy

* CollisionLayer: Merge getBlocking\*Edge methods into one

* CollisionLayer: Instead of a @collisionBoxes array, store @collisionBoxesByX
  and @collisionBoxesByY arrays. These are arrays sorted by x1 and y1, and as
  the player moves through the world and crosses X and Y coordinates of boxes,
  pointers would be updated which point to boxes in the two arrays. So we have
  pointers that point to the last boxes that the player has crossed (in the X
  and Y directions). Since the collision box arrays are sorted, the next box
  that the player reaches will be next in the array after the pointer, so we
  don't have to search the entire array every time.
