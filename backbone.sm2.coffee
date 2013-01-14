((root, factory) ->
  if typeof define == 'function' and define.amd
    define ['backbone', 'underscore'], (Backbone, _) ->
      root.Backbone.SM2 = factory(Backbone, _)
  else
    root.Backbone.SM2 = factory(root.Backbone, root._)
) this, (Backbone, _) ->

  class Player
    _.extend this.prototype, Backbone.Events

    constructor: ->
      @sound = undefined
      @queue = []

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
      else
        playable = @pop()

        # reached the end of the queue
        if not playable
          this.trigger('queue:end')
          return

        @sound = soundManager.createSound
          id: playable.id
          url: if _.isFunction(playable.url) then playable.url else playable.url
          onload: =>
            @trigger('track:playStart', playable, @sound)
            @sound.play()
            @preloadNext()
          onfinish: =>
            @trigger('track:finish', playable, @sound)
            @next()
        @sound.playable = playable
        @sound.load()
      @trigger('track:play', playable, @sound)
      @sound

    preloadNext: ->
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
      @trigger('track:skip', @sound.playable, @sound)
      @stop(true) if @sound?
      @play()

    setPosition: (position, relative = false) ->
      return unless @sound?
      position = if relative then @sound.position + position else position
      @sound.setPosition(position)

    pop: ->
      return if @queue.length == 0
      peek = @queue[0]
      playable = if _.isArray(@queue[0])
        # if 1 element left in playlist remove it from queue
        playlist = if peek.length == 1 then @queue.shift(1) else @queue[0]
        playlist.shift(1)
      else
        @queue.shift(1)
      @trigger('queue:pop', playable)
      playable

    getNext: ->
      return if @queue.length == 0
      peek = @queue[0]
      if _.isArray(peek) then peek[0] else peek


    isPlayable: (playable) ->
      playable? and playable.url and playable.id

    ensureSM2: ->
      throw new Events("SoundManager2 isn't ready") unless soundManager.ok()

  class PlayerView extends Backbone.View
    className: 'app'

    initialize: (options) ->
      @player = options?.player or new Player()
      unless options?.disablePlayerEvents
        @listenTo @player, 'track:play', @onPlay
        @listenTo @player, 'track:stop', @onStop
        @listenTo @player, 'track:pause', @onPause
        @listenTo @player, 'queue:add queue:pop', @onQueueChange

    onPlay: ->
    onStop: ->
    onPause: ->
    onQueueChange: ->

  {Player, PlayerView}
