Backbone.SM2
============

`Backbone.SM2` provides and integration layer between
[Backbone](http://backbonejs.org/) and
[SoundManager2](http://www.schillmania.com/projects/soundmanager2/) with the
followin features:

* player with a queue based on `Backbone.Collection`
* base view for constructing player UIs
* view for playback progress bars

## Installation

Grab
[backbone.sm2.js](https://raw.github.com/dreamindustries/backbone.sm2/master/backbone.sm2.js)
from repo (you will also need Backbone and SoundManager2 themselves) or use
[Bower](http://twitter.github.com/bower/) to install it along with dependencies:

```
% bower install backbone.sm2
```

## Player

`Backbone.SM2.Player` stands for a simple queue player based on SoundManager2.
Create a player and add tracks:

``` javascript
var player = new Backbone.SM2.Player({
    allowPreload:     true,  // use automatic preloading of the next track
    preloadThreshold: 155000 // track position in ms when to preload
});
```

`.add(playable)` — add `playable` to queue where `playable` either an object with
fields `id` and `url` (can be also a function) or an array of those objects,
fires `queue:add` event. You can also use your own `Backbone.Model` wrappers or even 
nest a `Backbone.Collection` of tracks

``` javascript
player.add({ url: url1, id: 't1'});
player.add(
    [
        {url: url2, id: 't2'},
        {url: url3, id: 't3'}
    ]
);
```

`play([id])` — play queued items, fires `track:play` event. Optionally, you can 
pass a track id to play.

`stop()` — stop playing, fires `track:stop` event.

`next()` — stop playing current item and move to the next one in queue, fires
`queue:next` event.

`prev()` — stop playing current item and move to the previous one in queue,
fires `queue:prev` event.

`pause()` — pause playback, can be resumed with `play()`, fires `track:stop`
event.

## Player View

You can define handlers for the events transmitted from the player (`onPlay`,
`onStop`, `onPause`, `onQueueAdd`, `onTrackInfoReceived`) and extend this view
according to your needs(see example in `tests`)

``` javascript
var playerView = new PlayerView({ player: player });
playerView.render();
```

## Progress bar view

`Backbone.SM2.ProgressBar` is a simple playback indicator, it shows track load
and playback proggress.

``` javascript
var progressBar = new Backbone.SM2.ProgressBar({
  el: $('#progressbar'),
  player: player
});
progressBar.render()
```

