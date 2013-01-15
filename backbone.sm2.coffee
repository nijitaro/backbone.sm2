((root, factory) ->
  if typeof define == 'function' and define.amd
    define ['backbone', 'underscore'], (Backbone, _) ->
      root.Backbone.SM2 = factory(Backbone, _)
  else
    root.Backbone.SM2 = factory(root.Backbone, root._)
) this, (Backbone, _) ->

  class QueueCursor
    constructor: (queue) ->
      @queue = queue
      @ref = -1

    cur: ->
      if _.isArray(@ref) then @queue[@ref[0]][@ref[1]] else @queue[@ref]

    peek: ->
      @nextImpl().next

    next: ->
      {next, ref} = @nextImpl()
      @ref = ref
      next

    prev: ->
      {prev, ref} = @prevImpl()
      @ref = ref
      prev

    # compute prev track in queue and prev ref but do not update them
    prevImpl: ->
      if _.isArray(@ref)
        ref = _.toArray(@ref)
        prev = @queue[ref[0]][ref[1] - 1]
        if prev
          ref[1] = ref[1] - 1
        else
          prev = @queue[ref[0] - 1]
          ref = ref[0] - 1
      else
        ref = @ref - 1
        prev = @queue[ref]

      if _.isArray(prev)
        ref = [ref, prev.length - 1]
        prev = prev[prev.length - 1]

      {ref, prev}

    # compute next track in queue and next ref but do not update them
    nextImpl: ->
      if _.isArray(@ref)
        ref = _.toArray(@ref)
        next = @queue[ref[0]][ref[1] + 1]
        if next
          ref[1] = ref[1] + 1
        else
          next = @queue[ref[0] + 1]
          ref = ref[0] + 1
      else
        ref = @ref + 1
        next = @queue[ref]

      if _.isArray(next)
        ref = [ref, 0]
        next = next[0]

      {ref, next}

  class Player
    _.extend this.prototype, Backbone.Events

    preloadThreshold: 5000 # msec

    constructor: (options) ->
      @allowPreload = options?.allowPreload
      @preloadThreshold = options?.preloadThreshold or @preloadThreshold
      @sound = undefined
      @nextSound = undefined
      @queue = []
      @cur = new QueueCursor(@queue)

    add: (track) ->
      @queue.push(track)
      @trigger('queue:add', track)

    isActive: (track, playState = 0) ->
      if track
        @sound?.playState == playState and @sound?.id == track.id
      else
        @sound?.playState == playState

    isPlaying: (track) ->
      @isActive(track, 1) and not @sound?.paused

    isPaused: (track) ->
      @isActive(track, 1) and @sound?.paused

    play: ->
      return if @isPlaying()
      if @sound?
        @sound.play()
        @trigger('track:play', @sound.track, @sound)
      else
        track = @cur.next()

        # reached the end of the queue
        if not track
          this.trigger('queue:end')
          return

        @sound = @initPlayable(track)
        @initSound(@sound)
      @sound

    pause: ->
      return unless @sound?
      @sound.pause()
      @trigger('track:pause', @sound.track, @sound)

    stop: (destruct = false) ->
      return unless @sound?
      @sound.stop()
      @trigger('track:stop', @sound.track, @sound)
      if destruct
        @sound.destruct()
        @sound = undefined

    next: ->
      return unless @sound?
      @stop(true)
      if @nextSound?
        @sound = @nextSound
        @initSound(@sound)
      else
        @play()
      @trigger('queue:next', @sound.track, @sound)
      @sound

    prev: ->
      return unless @sound?
      @stop(true)
      track = @cur.prev()

      # reached the start of the queue
      if not track
        return

      @sound = @initPlayable(track)
      @initSound(@sound)
      @trigger('queue:prev', @sound.track, @sound)
      @sound

    # init track with a sound object
    initPlayable: (track) ->
      sound = soundManager.createSound
        onload: =>
          @preloadNextFor(sound)
        onfinish: =>
          @trigger('track:finish', @sound.track, @sound)
          @next()
        whileplaying: =>
          @trigger 'track:whileplaying', track, sound
        whileloading: =>
          @trigger 'track:whileloading', track, sound
        id: track.id
        url: if _.isFunction(track.url) then track.url else track.url
      sound.track = track
      sound

    # start playing sound
    initSound: (sound) ->
      @sound = sound
      @nextSound = undefined
      @trigger('track:play', @sound.track, @sound)
      @sound.play()

    # set a callback on sound position to start preloading next track
    preloadNextFor: (sound) ->
      if @allowPreload?
        offset = sound.duration - @preloadThreshold
        sound.onPosition (offset), =>
          sound.clearOnPosition(offset)
          track = @cur.peek()
          @nextSound = @initPlayable(track)
          @nextSound.load()

  class PlayerView extends Backbone.View
    className: 'app'

    initialize: (options) ->
      @player = options?.player or new Player()
      unless options?.disablePlayerEvents
        @listenTo @player,
          'track:play': @onPlay
          'track:stop': @onStop
          'track:pause': @onPause
          'queue:add queue:pop': @onQueueChange

    onPlay: ->
    onStop: ->
    onPause: ->
    onQueueChange: ->

  class ProgressBar extends Backbone.View
    className: 'view-progress-bar'

    events:
      'click': 'onClick'

    initialize: (options) ->
      @$progressBar = undefined
      @$bufferingBar = undefined

      # current track id
      @trackId = undefined
      @player = options.player
      @listenTo @player,
        'track:play': @onPlay
        'track:stop': @onStop
        'track:whileplaying': @whilePlaying
        'track:whileloading': @whileLoading

    render: ->
      @$el.html """
        <div class="buffering-bar"></div>
        <div class="progress-bar"></div>
        """
      @updateElements()

    updateElements: ->
      @$progressBar = @$('.progress-bar')
      @$bufferingBar = @$('.buffering-bar')

    onClick: (e) ->
      return unless @trackId? and @player.sound?
      pos = (e.offsetX / @$el.width()) * @player.sound.duration
      @player.sound.setPosition(pos)

    onPlay: (track) ->
      @trackId = track.id

    onStop: ->
      @trackId = undefined
      @$progressBar.width(0)

    whilePlaying: (track, sound) ->
      if track.id == @trackId
        w = (sound.position / sound.duration) * @$el.width()
        @$progressBar.width(w)

    whileLoading: (track, sound) ->
      if track.id == @trackId
        w = (sound.bytesLoaded / sound.bytesTotal) * @$el.width()
        @$bufferingBar.width(w)

  {Player, PlayerView, ProgressBar}
