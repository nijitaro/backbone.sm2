Backbone.SM2
============

`Backbone.SM2` provides an integration layer between [Backbone][backbone] and
[SoundManager2][soundmanager2] with the following features:

* `Backbone.SM2.Player` player with a queue based on `Backbone.Collection`
* `Backbone.SM2.PlayerView` base view for constructing player UIs
* `Backbone.SM2.ProgressBar` view for playback progress bars

## Installation

Grab [backbone.sm2.js][builtjs] from the repo (you will also need Backbone and
SoundManager2 themselves) or use [Bower][bower] to install it along with
dependencies:

```
% bower install backbone.sm2
```

This library is also "AMD-ready" so you can load it with the help of [RequireJs][requirejs]
or any other AMD loader.

## Player

`Backbone.SM2.Player` stands for a simple queue player based on SoundManager2.

Constructor accepts two possible options — `allowPreload` and `preloadThreshold`
which controls if next track should be preloaded:

``` javascript
var player = new Backbone.SM2.Player({
    allowPreload:     true,  // use automatic preloading of the next track
    preloadThreshold: 155000 // track position in ms when to preload
});
```

### Player API

* `.add(playable)` — add `playable` to a queue where `playable` either an object
  with fields `id` and `url` (can be also a function) or an array of those
  objects. Fires an `queue:add` event. You can also pass your own instance of
  `Backbone.Model` or `Backbone.Collection` subclass.

  ``` javascript
player.add({url: url1, id: 't1'});
player.add(
    [
        {url: url2, id: 't2'},
        {url: url3, id: 't3'}
    ]
);
  ```

* `play([id])` — play queued items, fires `track:play` event. Optionally, you can
  pass a track id to play — this way also `queue:select` event will be fired.

* `stop()` — stop playing, fires `track:stop` event.

* `next()` — stop playing current item and move to the next one in queue, fires
  `queue:next` event.

* `prev()` — stop playing current item and move to the previous one in queue,
  fires `queue:prev` event.

* `pause()` — pause playback, can be resumed with `play()`, fires `track:pause`
  event.

## Player View

`Backbone.SM2.PlayerView` provides a shortcut view for constructing UIs for a
player.

You can define handlers for the events transmitted from the player (`onPlay`,
`onStop`, `onPause`, `onQueueAdd`, `onTrackInfoReceived`) and extend this view
according to your needs(see example in the [`tests`][tests] directory in the
repo).

``` javascript
var playerView = new PlayerView({player: player});
playerView.render();
```

## Progress bar view

`Backbone.SM2.ProgressBar` is a simple playback indicator, it shows track load
and playback proggress.

``` javascript
var ProgressBar = Backbone.SM2.ProgressBar.extend({
  render: function() {
    this.$el.append($('<div class="progress-bar"></div>'));
    this.$el.append($('<div class="buffering-bar"></div>'));
  }
});
var progressBar = new ProgressBar({player: player});
progressBar.render()
```

You should redefine `render()` method to put `.progress-bar` and
`.buffering-bar` elements inside view's `el`.

[soundmanager2]: http://www.schillmania.com/projects/soundmanager2/
[backbone]: http://backbonejs.org/
[builtjs]: https://raw.github.com/dreamindustries/backbone.sm2/master/backbone.sm2.js
[bower]: http://twitter.github.com/bower/
[tests]: https://github.com/dreamindustries/backbone.sm2/blob/master/tests/index.html
[requirejs]: http://requirejs.org
