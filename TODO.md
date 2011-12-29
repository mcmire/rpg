# TODO

* A quick keyup, keydown of an arrow key while holding down Command will result
  in the character moving until the arrow key is keyup / keydown'ed again. It
  also happens if the arrow key is keydown'ed, Command is keydown'ed, then the
  arrow key is keyup'ed. Essentially the keyup event for the arrow key is never
  fired. (FIXED?)
