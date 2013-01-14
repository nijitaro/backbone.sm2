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
      @_sound = undefined
      @_queue = []

    queue: (playable) ->
      @_queue.push(playable)
      this.trigger('queue', playable)

    isActive: (playable, playState = 0) ->
      if playable
        @_sound?.playState == playState and @_sound?.id == playable.id
      else
        @_sound?.playState == playState

    isPlaying: (playable) ->
      @isActive(playable, 1) and not @_sound?.paused

    play: ->
      return if @isPlaying()
      if @_sound?
        @_sound.play()
      else
        playable = @getNextPlayable()
        @_sound = soundManager.createSound
          id: playable.id
          url: if _.isFunction(playable.url) then playable.url else playable.url
          onload: => @_sound.play()
        @_sound.load()
      this.trigger('play', @_sound)

    pause: ->
      return unless @_sound?
      @_sound.pause()
      this.trigger('pause', @_sound)

    stop: ->
      return unless @_sound?
      @_sound.stop()
      this.trigger('stop', @_sound)

    setPosition: (position, relative = false) ->
      return unless @_sound?
      position = if relative then @_sound.position + position else position
      @_sound.setPosition(position)

    getNextPlayable: ->
      return if @_queue.length == 0
      peek = @_queue[0]
      if _.isArray(@_queue[0])
        # if 1 element left in playlist remove it from queue
        playlist = if peek.length == 1 then @_queue.shift(1) else @_queue[0]
        playlist.shift(1)
      else
        @_queue.shift(1)

    isPlayable: (playable) ->
      playable? and playable.url and playable.id

    ensureSM2: ->
      throw new Events("SoundManager2 isn't ready") unless soundManager.ok()

  class PlayerView extends Backbone.View
    className: 'app'

    initialize: (options) ->
      this.player = options?.player or new Player()

  {Player, PlayerView}
