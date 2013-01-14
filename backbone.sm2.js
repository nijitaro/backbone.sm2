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
  var Player, PlayerView;
  Player = (function() {

    _.extend(Player.prototype, Backbone.Events);

    function Player() {
      this.sound = void 0;
      this.queue = [];
    }

    Player.prototype.add = function(playable) {
      this.queue.push(playable);
      return this.trigger('queueAdd', playable);
    };

    Player.prototype.isActive = function(playable, playState) {
      var _ref, _ref1, _ref2;
      if (playState == null) {
        playState = 0;
      }
      if (playable) {
        return ((_ref = this.sound) != null ? _ref.playState : void 0) === playState && ((_ref1 = this.sound) != null ? _ref1.id : void 0) === playable.id;
      } else {
        return ((_ref2 = this.sound) != null ? _ref2.playState : void 0) === playState;
      }
    };

    Player.prototype.isPlaying = function(playable) {
      var _ref;
      return this.isActive(playable, 1) && !((_ref = this.sound) != null ? _ref.paused : void 0);
    };

    Player.prototype.isPaused = function(playable) {
      var _ref;
      return this.isActive(playable, 1) && ((_ref = this.sound) != null ? _ref.paused : void 0);
    };

    Player.prototype.play = function() {
      var playable,
        _this = this;
      if (this.isPlaying()) {
        return;
      }
      if (this.sound != null) {
        this.sound.play();
      } else {
        playable = this.pop();
        if (!playable) {
          this.trigger('queueEnd');
          return;
        }
        this.sound = soundManager.createSound({
          id: playable.id,
          url: _.isFunction(playable.url) ? playable.url : playable.url,
          onload: function() {
            _this.trigger('playStart', playable, _this.sound);
            _this.sound.play();
            return _this.preloadNext();
          }
        });
        this.sound.playable = playable;
        this.sound.load();
      }
      return this.trigger('play', playable, this.sound);
    };

    Player.prototype.preloadNext = function() {};

    Player.prototype.pause = function() {
      if (this.sound == null) {
        return;
      }
      this.sound.pause();
      return this.trigger('pause', this.sound.playable, this.sound);
    };

    Player.prototype.stop = function(destruct) {
      if (destruct == null) {
        destruct = false;
      }
      if (this.sound == null) {
        return;
      }
      this.sound.stop();
      this.trigger('stop', this.sound.playable, this.sound);
      if (destruct) {
        this.sound.destruct();
        return this.sound = void 0;
      }
    };

    Player.prototype.next = function() {
      if (this.sound != null) {
        this.stop(true);
      }
      return this.play();
    };

    Player.prototype.setPosition = function(position, relative) {
      if (relative == null) {
        relative = false;
      }
      if (this.sound == null) {
        return;
      }
      position = relative ? this.sound.position + position : position;
      return this.sound.setPosition(position);
    };

    Player.prototype.pop = function() {
      var peek, playable, playlist;
      if (this.queue.length === 0) {
        return;
      }
      peek = this.queue[0];
      playable = _.isArray(this.queue[0]) ? (playlist = peek.length === 1 ? this.queue.shift(1) : this.queue[0], playlist.shift(1)) : this.queue.shift(1);
      this.trigger('queuePop', playable);
      return playable;
    };

    Player.prototype.getNext = function() {
      var peek;
      if (this.queue.length === 0) {
        return;
      }
      peek = this.queue[0];
      if (_.isArray(peek)) {
        return peek[0];
      } else {
        return peek;
      }
    };

    Player.prototype.isPlayable = function(playable) {
      return (playable != null) && playable.url && playable.id;
    };

    Player.prototype.ensureSM2 = function() {
      if (!soundManager.ok()) {
        throw new Events("SoundManager2 isn't ready");
      }
    };

    return Player;

  })();
  PlayerView = (function(_super) {

    __extends(PlayerView, _super);

    function PlayerView() {
      return PlayerView.__super__.constructor.apply(this, arguments);
    }

    PlayerView.prototype.className = 'app';

    PlayerView.prototype.initialize = function(options) {
      this.player = (options != null ? options.player : void 0) || new Player();
      if (!(options != null ? options.disablePlayerEvents : void 0)) {
        this.listenTo(this.player, 'play', this.onPlay);
        this.listenTo(this.player, 'stop', this.onStop);
        this.listenTo(this.player, 'pause', this.onPause);
        return this.listenTo(this.player, 'queueAdd queuePop', this.onQueueChange);
      }
    };

    PlayerView.prototype.onPlay = function() {};

    PlayerView.prototype.onStop = function() {};

    PlayerView.prototype.onPause = function() {};

    PlayerView.prototype.onQueueChange = function() {};

    return PlayerView;

  })(Backbone.View);
  return {
    Player: Player,
    PlayerView: PlayerView
  };
});
