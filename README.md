# Link to the Past

This is a clone of *Legend of Zelda: Link to the Past* for the SNES, written
entirely in JavaScript.

Current progress on Heroku here: <http://zelda-lttp.herokuapp.com>

## Pre-flight

Bundler is being used to load the few dependencies this app has at runtime, so
you'll want to make sure you have that installed. Then run:

    bundle install --binstubs

## Running the game

The game runs inside a Sinatra app, because it just ends up being easier. To
boot the app all you have to say is:

    bin/rackup -p PORT

Now visit <http://localhost:PORT>, and you're off to the races.

## Developing

Sass is being used for stylesheets, and CoffeeScript is being used for the
JavaScript. To play nice with Sinatra (and also make it so the app is deployable
to Heroku), CSS and JavaScript files are generated and stored in the repo. It
would be a pain to do this manually, so [Guard](http://github.com/guard/guard)
monitors the `app/stylesheets` and `app/javascripts` directory, and when you
update a source file, it is compiled and placed in the appropriate directory
(`public/stylesheets` and `public/javascripts`, respectively). So, before you
start writing code, simply run:

    bin/guard

## Architecture

Except for a few images, the game is built entirely using Javascript, CSS, and
the HTML5 Canvas API.

One thing you need to know is that instead of using jQuery, I've opted to use a
collection of microframeworks, packaged together using
[Ender](http://ender.no.de). I think the idea Ender brings to the table is
pretty neat, so I'm trying it out. While working with several modules is a bit
more cumbersome, the reduced size of these microframeworks compared to jQuery is
very encouraging (as an example, our package measures 70kb compared to jQuery
1.5.2, which is 221kb!).

The concatened version of the package we are using is located at
`vendor/javascripts/ender.js` for you to inspect. It's important to note that
these modules approximate, but don't exactly match, the jQuery API. You'll want
to read up on each one. Here's the full list of modules in our package:

* [domReady](http://github.com/ded/domready) - A cross-browser domReady. With
  Ender, this is available as `$.domReady(function() { ... })`.
* [Bonzo](http://github.com/ded/bonzo) + [Qwery](http://github.com/ded/qwery) -
  A DOM utility library and DOM selector engine. With Ender, you can say e.g.
  `$('div > p).hide()`, `$('<div />).attr("id", "foo")`, etc.
* [Bean](http://github.com/ded/bean) - DOM event library. With Ender, you can
  say e.g. `$('div').bind('click', function() { ... })`,
  `$(window).trigger('customevent')`, etc.
* [Valentine](http://github.com/ded/valentine) - General purpose utility
  library. This is basically along the same lines as Underscore, so you can say
  e.g. `$.v.each(function() { ... })`, `$.v.map(function() { ... })`, etc. There
  are a few methods in Underscore that Valentine doesn't have, and the type
  checking methods that Valentine has are a different API than Underscore. Most
  importantly, the callback passed to `each()` is called with different
  arguments in Valentine than Underscore. It's a bit confusing actually: for an
  array, it uses the native `forEach()`, so it's `callback(elem, idx, ary)`, but
  for an object, it's `callback(key, val, obj)`. Perhaps a later update will
  correct this.

## Roadmap

See TODO.md. I tend to update that as I go along.

## How are you creating the game? You *do* know there's an SNES emulator in Javascript, right?

Yup, but I prefer to do it manually. Basically, I load the game in ZSNES or
SNES9x and copy it that way. Thanks to various sources on the interwebs for
images of tiles and sprites.

## Author/Contact

This project is (c) 2011-2012 Elliot Winkler. If you have any questions, please
feel free to contact me through these channels:

* **Twitter**: [@mcmire](http://twitter.com/mcmire)
* **Email**: <elliot.winkler@gmail.com>
* (And, of course, on the githubs)

## License

All code here is free to use for commercial and personal purposes. An attached
courtesy is not required, but appreciated. Use your powers wisely. Be nice!
