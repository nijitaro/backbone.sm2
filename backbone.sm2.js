// Generated by CoffeeScript 1.4.0
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define(['backbone', 'underscore'], function(Backbone, _) {
      return root.Backbone.SM2 = factory(Backbone, _);
    });
  } else {
    return root.Backbone.SM2 = factory(root.Backbone, root._);
  }
})(this, function(Backbone, _) {
  /**
   * Track model
  */

  var Player, PlayerView, ProgressBar, QueueCursor, Track, Tracks;
  Track = (function(_super) {

    __extends(Track, _super);

    function Track() {
      return Track.__super__.constructor.apply(this, arguments);
    }

    return Track;

  })(Backbone.Model);
  /**
   * Tracks collection
  */

  Tracks = (function(_super) {

    __extends(Tracks, _super);

    function Tracks() {
      return Tracks.__super__.constructor.apply(this, arguments);
    }

    Tracks.prototype.model = Track;

    return Tracks;

  })(Backbone.Collection);
  /**
   * Playlist iterator('cursor') pointed at currently played track and returning
   * previous and next tracks in the queue
  */

  QueueCursor = (function() {

    function QueueCursor(queue) {
      this.queue = queue;
      this.ref = -1;
    }

    QueueCursor.prototype.cur = function() {
      if (_.isArray(this.ref)) {
        return this.queue.at(this.ref[0]).at(this.ref[1]);
      } else {
        return this.queue.at(this.ref);
      }
    };

    QueueCursor.prototype.peek = function() {
      return this.nextImpl().next;
    };

    QueueCursor.prototype.next = function() {
      var next, ref, _ref;
      _ref = this.nextImpl(), next = _ref.next, ref = _ref.ref;
      this.ref = ref;
      return next;
    };

    QueueCursor.prototype.prev = function() {
      var prev, ref, _ref;
      _ref = this.prevImpl(), prev = _ref.prev, ref = _ref.ref;
      this.ref = ref;
      return prev;
    };

    QueueCursor.prototype.prevImpl = function() {
      var prev, ref;
      if (_.isArray(this.ref)) {
        ref = this.ref.slice();
        prev = this.queue.at(ref[0]).get('tracks').at(ref[1] - 1);
        if (prev) {
          ref[1] = ref[1] - 1;
        } else {
          prev = this.queue.at(ref[0] - 1);
          ref = ref[0] - 1;
        }
      } else {
        ref = this.ref - 1;
        prev = this.queue.at(ref);
      }
      if (!prev) {
        return {
          ref: -1,
          prev: prev
        };
      }
      if (prev.get('tracks')) {
        ref = [ref, prev.get('tracks').length - 1];
        prev = prev.get('tracks').last();
      }
      return {
        ref: ref,
        prev: prev
      };
    };

    QueueCursor.prototype.nextImpl = function() {
      var next, ref;
      if (_.isArray(this.ref)) {
        ref = this.ref.slice();
        next = this.queue.at(ref[0]).get('tracks').at(ref[1] + 1);
        if (next) {
          ref[1] = ref[1] + 1;
        } else {
          next = this.queue.at(ref[0] + 1);
          ref = ref[0] + 1;
        }
      } else {
        ref = this.ref + 1;
        next = this.queue.at(ref);
      }
      if (!next) {
        return {
          ref: this.ref,
          next: this.cur()
        };
      }
      if (next.get('tracks')) {
        ref = [ref, 0];
        next = next.get('tracks').at(0);
      }
      return {
        ref: ref,
        next: next
      };
    };

    return QueueCursor;

  })();
  /**
   * Player class
  */

  Player = (function() {

    _.extend(Player.prototype, Backbone.Events);

    Player.prototype.preloadThreshold = 5000;

    function Player(options) {
      this.allowPreload = options != null ? options.allowPreload : void 0;
      this.preloadThreshold = (options != null ? options.preloadThreshold : void 0) || this.preloadThreshold;
      this.sound = void 0;
      this.nextSound = void 0;
      this.queue = new Tracks();
      this.cur = new QueueCursor(this.queue);
    }

    Player.prototype.add = function(track) {
      track = _.isArray(track) ? new Track({
        tracks: new Tracks(track)
      }) : new Track(track);
      this.queue.add(track);
      return this.trigger('queue:add', track);
    };

    Player.prototype.isActive = function(track, playState) {
      var _ref, _ref1, _ref2;
      if (playState == null) {
        playState = 0;
      }
      if (track) {
        return ((_ref = this.sound) != null ? _ref.playState : void 0) === playState && ((_ref1 = this.sound) != null ? _ref1.id : void 0) === track.id;
      } else {
        return ((_ref2 = this.sound) != null ? _ref2.playState : void 0) === playState;
      }
    };

    Player.prototype.isPlaying = function(track) {
      var _ref;
      return this.isActive(track, 1) && !((_ref = this.sound) != null ? _ref.paused : void 0);
    };

    Player.prototype.isPaused = function(track) {
      var _ref;
      return this.isActive(track, 1) && ((_ref = this.sound) != null ? _ref.paused : void 0);
    };

    Player.prototype.play = function() {
      var track;
      if (this.isPlaying()) {
        return;
      }
      if (this.sound != null) {
        this.sound.play();
        this.trigger('track:play', this.sound.track, this.sound);
      } else {
        track = this.cur.next();
        if (!track) {
          this.trigger('queue:end');
          return;
        }
        this.sound = this.initPlayable(track);
        this.initSound(this.sound);
      }
      return this.sound;
    };

    Player.prototype.pause = function() {
      if (this.sound == null) {
        return;
      }
      this.sound.pause();
      return this.trigger('track:pause', this.sound.track, this.sound);
    };

    Player.prototype.stop = function(destruct) {
      if (destruct == null) {
        destruct = false;
      }
      if (this.sound == null) {
        return;
      }
      this.sound.stop();
      this.trigger('track:stop', this.sound.track, this.sound);
      if (destruct) {
        this.sound.destruct();
        return this.sound = void 0;
      }
    };

    Player.prototype.next = function() {
      if (this.sound == null) {
        return;
      }
      this.stop(true);
      if (this.nextSound != null) {
        this.sound = this.nextSound;
        this.initSound(this.sound);
        this.cur.next();
      } else {
        this.play();
      }
      if (this.sound) {
        this.trigger('queue:next', this.sound.track, this.sound);
      }
      return this.sound;
    };

    Player.prototype.prev = function() {
      var track;
      if (this.sound == null) {
        return;
      }
      this.stop(true);
      track = this.cur.prev();
      if (!track) {
        return;
      }
      this.sound = this.initPlayable(track);
      this.initSound(this.sound);
      if (this.sound) {
        this.trigger('queue:prev', this.sound.track, this.sound);
      }
      return this.sound;
    };

    Player.prototype.initPlayable = function(track, preload) {
      var sound,
        _this = this;
      if (preload == null) {
        preload = false;
      }
      sound = soundManager.createSound({
        onid3: function() {
          return _this.trigger('track:id3loaded', track, sound.id3);
        },
        onload: function() {
          return _this.preloadNextFor(sound);
        },
        onfinish: function() {
          _this.trigger('track:finish', _this.sound.track, _this.sound);
          return _this.next();
        },
        id: track.get('id'),
        url: _.isFunction(track.get('url')) ? track.get('url')() : track.get('url'),
        whileplaying: function() {
          return _this.trigger('track:whileplaying', track, sound);
        },
        whileloading: function() {
          return _this.trigger('track:whileloading', track, sound);
        }
      });
      sound.track = track;
      return sound;
    };

    Player.prototype.initSound = function(sound) {
      this.sound = sound;
      this.nextSound = void 0;
      this.trigger('track:play', this.sound.track, this.sound);
      return this.sound.play();
    };

    Player.prototype.preloadNextFor = function(sound) {
      var offset,
        _this = this;
      if (this.allowPreload != null) {
        offset = sound.duration - this.preloadThreshold;
        return sound.onPosition(offset, function() {
          var track;
          sound.clearOnPosition(offset);
          track = _this.cur.peek();
          _this.nextSound = _this.initPlayable(track);
          return _this.nextSound.load();
        });
      }
    };

    return Player;

  })();
  /**
   * Player app
  */

  PlayerView = (function(_super) {

    __extends(PlayerView, _super);

    function PlayerView() {
      return PlayerView.__super__.constructor.apply(this, arguments);
    }

    PlayerView.prototype.className = 'app';

    PlayerView.prototype.initialize = function(options) {
      this.player = (options != null ? options.player : void 0) || new Player();
      if (this.onPlay) {
        this.listenTo(this.player, 'track:play', this.onPlay);
      }
      if (this.onStop) {
        this.listenTo(this.player, 'track:stop', this.onStop);
      }
      if (this.onPause) {
        this.listenTo(this.player, 'track:pause', this.onPause);
      }
      if (this.onQueueAdd) {
        this.listenTo(this.player, 'queue:add', this.onQueueAdd);
      }
      if (this.onTrackInfoReceived) {
        return this.listenTo(this.player, 'track:id3loaded', this.onTrackInfoReceived);
      }
    };

    return PlayerView;

  })(Backbone.View);
  /**
   * Progress bar
  */

  ProgressBar = (function(_super) {

    __extends(ProgressBar, _super);

    function ProgressBar() {
      return ProgressBar.__super__.constructor.apply(this, arguments);
    }

    ProgressBar.prototype.className = 'view-progress-bar';

    ProgressBar.prototype.events = {
      'click': 'onClick'
    };

    ProgressBar.prototype.initialize = function(options) {
      this.$progressBar = void 0;
      this.$bufferingBar = void 0;
      this.trackId = void 0;
      this.player = options.player;
      return this.listenTo(this.player, {
        'track:play': this.onPlay,
        'track:stop': this.onStop,
        'track:whileplaying': this.whilePlaying,
        'track:whileloading': this.whileLoading
      });
    };

    ProgressBar.prototype.render = function() {
      this.$el.html("<div class=\"buffering-bar\"></div>\n<div class=\"progress-bar\"></div>");
      return this.updateElements();
    };

    ProgressBar.prototype.updateElements = function() {
      this.$progressBar = this.$('.progress-bar');
      return this.$bufferingBar = this.$('.buffering-bar');
    };

    ProgressBar.prototype.onClick = function(e) {
      var pos;
      if (!((this.trackId != null) && (this.player.sound != null))) {
        return;
      }
      pos = (e.offsetX / this.$el.width()) * this.player.sound.duration;
      return this.player.sound.setPosition(pos);
    };

    ProgressBar.prototype.onPlay = function(track) {
      return this.trackId = track.id;
    };

    ProgressBar.prototype.onStop = function() {
      this.trackId = void 0;
      return this.$progressBar.width(0);
    };

    ProgressBar.prototype.whilePlaying = function(track, sound) {
      var maxW, w;
      if (track.id === this.trackId) {
        maxW = this.$el.width();
        w = (sound.position / sound.duration) * maxW;
        return this.$progressBar.width(Math.min(w, maxW));
      }
    };

    ProgressBar.prototype.whileLoading = function(track, sound) {
      var maxW, w;
      if (track.id === this.trackId) {
        maxW = this.$el.width();
        w = (sound.bytesLoaded / sound.bytesTotal) * maxW;
        return this.$bufferingBar.width(Math.min(w, maxW));
      }
    };

    return ProgressBar;

  })(Backbone.View);
  return {
    Player: Player,
    PlayerView: PlayerView,
    ProgressBar: ProgressBar
  };
});
