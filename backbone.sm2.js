// Generated by CoffeeScript 1.4.0

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define(['backbone', 'underscore'], function(Backbone, _) {
      return root.Backbone.SM2 = factory(Backbone, _);
    });
  } else {
    return root.Backbone.SM2 = factory(root.Backbone, root._);
  }
})(this, function(Backbone, _) {
  var Player;
  Player = (function() {

    _.extend(Player.prototype, Backbone.Events);

    function Player() {
      this._sound = void 0;
      this._queue = [];
    }

    Player.prototype.queue = function(playable) {
      return this._queue.push(playable);
    };

    Player.prototype.isActive = function(playable, playState) {
      var _ref, _ref1, _ref2;
      if (playState == null) {
        playState = 0;
      }
      if (playable) {
        return ((_ref = this._sound) != null ? _ref.playState : void 0) === playState && ((_ref1 = this._sound) != null ? _ref1.id : void 0) === playable.id;
      } else {
        return ((_ref2 = this._sound) != null ? _ref2.playState : void 0) === playState;
      }
    };

    Player.prototype.isPlaying = function(playable) {
      var _ref;
      return this.isActive(playable, 1) && !((_ref = this._sound) != null ? _ref.paused : void 0);
    };

    Player.prototype.play = function() {
      if (this.isPlaying()) {
        return;
      }
      if (!(this._sound != null)) {
        return {
          url: url,
          id: id
        };
      }
    };

    Player.prototype.pause = function() {
      if (this._sound == null) {
        return;
      }
      return this._sound.pause();
    };

    Player.prototype.stop = function() {
      if (this._sound == null) {
        return;
      }
      return this._sound.stop();
    };

    Player.prototype.setPosition = function(position, relative) {
      if (relative == null) {
        relative = false;
      }
      if (this._sound == null) {
        return;
      }
      position = relative ? this._sound.position + position : position;
      return this._sound.setPosition(position);
    };

    Player.prototype.getNextPlayable = function() {
      var peek, playlist;
      if (this._queue.length === 0) {
        return;
      }
      peek = this._queue[0];
      if (_.isArray(this._queue[0])) {
        playlist = peek.length === 1 ? this._queue.shift(1) : this._queue[0];
        return playlist.shift(1);
      } else {
        return this._queue.shift(1);
      }
    };

    Player.prototype.getPlayable = function(playable) {
      var url;
      url = _.isFunction(playable.url) ? playable.url : playable.url;
      if (url == null) {
        throw new Error("undefined url for " + playable);
      }
      return url;
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
  return {
    Player: Player
  };
});
