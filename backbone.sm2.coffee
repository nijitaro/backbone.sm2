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

    constructor: ->
      @sound = undefined
      @queue = []
      @cur = new QueueCursor(@queue)

    add: (playable) ->
      @queue.push(playable)
      @trigger('queue:add', playable)

    isActive: (playable, playState = 0) ->
      if playable
        @sound?.playState == playState and @sound?.id == playable.id
      else
        @sound?.playState == playState

    isPlaying: (playable) ->
      @isActive(playable, 1) and not @sound?.paused

    isPaused: (playable) ->
      @isActive(playable, 1) and @sound?.paused

    play: ->
      return if @isPlaying()
      if @sound?
        @sound.play()
        @trigger('track:play', playable, @sound)
      else
        playable = @cur.next()

        # reached the end of the queue
        if not playable
          this.trigger('queue:end')
          return

        @setPlayable(playable)
      @sound

    preloadNext: (sound) ->
      # prepare sound object instead of descriptor

    pause: ->
      return unless @sound?
      @sound.pause()
      @trigger('track:pause', @sound.playable, @sound)

    stop: (destruct = false) ->
      return unless @sound?
      @sound.stop()
      @trigger('track:stop', @sound.playable, @sound)
      if destruct
        @sound.destruct()
        @sound = undefined

    next: ->
      return unless @sound?
      @stop(true)
      @play()
      @trigger('queue:next', @sound.playable, @sound)
      @sound

    prev: ->
      return unless @sound?
      @stop(true)
      playable = @cur.prev()

      # reached the start of the queue
      if not playable
        return

      @setPlayable(playable)
      @trigger('queue:prev', @sound.playable, @sound)
      @sound

    setPlayable: (playable) ->
      @sound = soundManager.createSound
        id: playable.id
        url: if _.isFunction(playable.url) then playable.url else playable.url
        onload: =>
          @trigger('track:playStart', playable, @sound)
          @sound.play()
          @preloadNext(@sound)
        onfinish: =>
          @trigger('track:finish', playable, @sound)
          @next()
      @sound.playable = playable
      @trigger('track:play', playable, @sound)
      @sound.load()

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

  {Player, PlayerView}
