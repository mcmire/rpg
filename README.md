# THE GAME

## What is this?

It's a game that [@levicole](http://github.com/levicole) and I are working on. The goal is to run in the browser using Javascript and the HTML5 Canvas tag (and probably some other HTML5-y things too).

## Before you do anything

Bundler is being used to load the few dependencies this app has at runtime, so you'll want to make sure you have that installed. Then run:

    bundle install

## Running

Technically you could just load the main HTML page in your browser. We plan on uploading this to Heroku, though, so we just decided to make it a proper app. We're just using Sinatra, so to boot the app all you have to say is:

    bundle exec rackup -p PORT

Now visit <http://localhost:PORT>, and you're off to the races.

## Developing

Sass is being used for stylesheets, and CoffeeScript is being used for the Javascript. To play nice with Sinatra, CSS and Javascript files are generated and stored in the repo. It would be a pain to do this manually, so [Guard](http://github.com/guard/guard) monitors the `app/stylesheets` and `app/javascripts` directory, and when you update a source file, it is compiled and placed in the appropriate directory (`public/stylesheets` and `public/javascripts`, respectively). So, before you start writing code, simply run:

    bundle exec guard

## Architecture

Except for a few images, the game is built entirely using Javascript, CSS, and the HTML5 Canvas API.

One thing you need to know is that instead of using jQuery, we've opted to use a collection of microframeworks, packaged together using [Ender](http://ender.no.de). Probably this is not totally necessary, as I haven't bother to optimize the sprite editor yet, but I think the idea Ender brings to the table is pretty neat, so I'm trying it out. While working with several modules is a bit more cumbersome, the reduced size of these microframeworks compared to jQuery is very encouraging (as an example, our package measures 70kb compared to jQuery 1.5.2, which is 221kb!).

The concatened version of the package we are using is located at javascripts/ender.js for you to inspect. It's important to note that these modules approximate, but don't exactly match, the jQuery API. You'll want to read up on each one. Here's the full list of modules in our package:

* [domReady](http://github.com/ded/domready) - A cross-browser domReady. With Ender, this is available as `$.domReady(function() { ... })`.
* [Bonzo](http://github.com/ded/bonzo) + [Qwery](http://github.com/ded/qwery) - A DOM utility library and DOM selector engine. With Ender, you can say e.g. `$('div > p).hide()`, `$('<div />).attr("id", "foo")`, etc.
* [Bean](http://github.com/ded/bean) - DOM event library. With Ender, you can say e.g. `$('div').bind('click', function() { ... })`, `$(window).trigger('customevent')`, etc.
* [Emilé](http://github.com/madrobby/emile) - DOM animation library. With Ender you can say e.g. `$('div').animate({opacity: 1, duration: 0.3})`, `$('p').fadeIn()`, `$('p').fadeOut()`, etc.
* [Reqwest](http://github.com/ded/reqwest) - Utility library for making Ajax requests. With Ender, you can say e.g. `$.ajax({url: ..., type: ..., success: ..., failure: ...})`
* [klass](http://github.com/ded/klass) - Utility library for expressively creating classes. With Ender, you can say e.g. `$.klass(function() { ... }).statics(...).methods(...)`.
* [Valentine](http://github.com/ded/valentine) - General purpose utility library. This is basically along the same lines as Underscore, so you can say e.g. `$.v.each(function() { ... })`, `$.v.map(function() { ... })`, etc. There are a few methods in Underscore that Valentine doesn't have, and the type checking methods that Valentine has are a different API than Underscore. Most importantly, the callback passed to `each()` is called with different arguments in Valentine than Underscore. It's a bit confusing actually: for an array, it uses the native `forEach()`, so it's `callback(elem, idx, ary)`, but for an object, it's `callback(key, val, obj)`. Perhaps a later update will correct this.

## Roadmap

There's a public Pivotal Tracker project here: <https://www.pivotaltracker.com/projects/289453>
