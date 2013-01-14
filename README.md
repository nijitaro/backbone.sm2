Backbone.SM2 provides and integration layer between Backbone and SoundManager2.

class `Backbone.SM2.Player`

  `add(playable)` — add `playable` to queue where `playable` either an object with
  fields `id` and `url` (can be also a function) or an array of those objects,
  fires `queue:add` event.

  `play()` — play queued items, fires `track:play` event.

  `stop()` — stop playing, fires `track:stop` event.

  `next()` — stop playing current item and move to the next one in queue, fires
  `queue:next` event.

  `prev()` — stop playing current item and move to the previous one in queue,
  fires `queue:prev` event.

  `pause()` — payuse playback, can be resumed with `play()`, fires `track:stop`
  event.
