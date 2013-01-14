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

    isActive: (playable, playState = 0) ->
      if playable
        @_sound?.playState == playState and @_sound?.id == playable.id
      else
        @_sound?.playState == playState

    isPlaying: (playable) ->
      @isActive(playable, 1) and not @_sound?.paused

    play: ->
      return if @isPlaying()
      if not @_sound?
        {url, id}

    pause: ->
      return unless @_sound?
      @_sound.pause()

    stop: ->
      return unless @_sound?
      @_sound.stop()

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

    getPlayable: (playable) ->
      url = if _.isFunction(playable.url) then playable.url else playable.url
      throw new Error("undefined url for #{playable}") unless url?
      url

    isPlayable: (playable) ->
      playable? and playable.url and playable.id

    ensureSM2: ->
      throw new Events("SoundManager2 isn't ready") unless soundManager.ok()

  {Player}
