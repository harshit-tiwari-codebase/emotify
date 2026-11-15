import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Music,
  Maximize2,
  Minimize2,
} from "lucide-react";

const formatTime = (secs) => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const MusicPlayer = ({
  currentTrack,
  playlist = [],
  onTrackSelect,
  isFavorited = false,
  onToggleFavorite,
  detectedMood = "Neutral",
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioError, setAudioError] = useState("");

  useEffect(() => {
    if (!currentTrack || !currentTrack.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.load();

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioError("");
          })
          .catch((err) => {
            console.warn("Autoplay prevented or audio source loading:", err.message);
            setIsPlaying(false);
          });
      }
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError("");
        })
        .catch((err) => {
          setAudioError("Click to play (Browser sound policy)");
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleNext = () => {
    if (!playlist || playlist.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      onTrackSelect(playlist[randomIndex]);
      return;
    }
    const currentIndex = playlist.findIndex(
      (t) => (t.id || t.trackId) === (currentTrack?.id || currentTrack?.trackId)
    );
    const nextIndex = (currentIndex + 1) % playlist.length;
    onTrackSelect(playlist[nextIndex]);
  };

  const handlePrev = () => {
    if (!playlist || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(
      (t) => (t.id || t.trackId) === (currentTrack?.id || currentTrack?.trackId)
    );
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    onTrackSelect(playlist[prevIndex]);
  };

  const handleEnded = () => {
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  if (!currentTrack) {
    return (
      <div className="player-dock-empty">
        <Music className="w-5 h-5 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-400">
          Select or detect your mood to start the music player
        </span>
      </div>
    );
  }

  const trackDuration = duration || (currentTrack.duration ? 180 : 0);
  const progressPercent = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;

  return (
    <section className={`player-wrapper ${isExpanded ? "player-wrapper--expanded" : ""}`}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => setAudioError("Audio stream loading preview...")}
      />

      <div className="player-inner">
        {/* Track Info */}
        <div className="player-track-info">
          <div className="player-artwork-box">
            {currentTrack.artwork ? (
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                className="player-artwork-img"
              />
            ) : (
              <div className="player-artwork-fallback">
                <Music className="w-6 h-6 text-purple-400" />
              </div>
            )}
            {isPlaying && (
              <div className="player-equalizer-overlay">
                <span className="eq-bar eq-bar-1" />
                <span className="eq-bar eq-bar-2" />
                <span className="eq-bar eq-bar-3" />
              </div>
            )}
          </div>

          <div className="player-metadata">
            <div className="flex items-center gap-2">
              <h4 className="player-track-title">{currentTrack.title}</h4>
              <span className="player-mood-pill">{currentTrack.mood || detectedMood}</span>
            </div>
            <p className="player-track-artist">{currentTrack.artist}</p>
            {audioError && <span className="player-error-text">{audioError}</span>}
          </div>

          <button
            type="button"
            className={`player-icon-btn ${isFavorited ? "text-red-400 fill-red-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => onToggleFavorite && onToggleFavorite(currentTrack)}
            title={isFavorited ? "Remove from favorites" : "Save to favorites"}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current text-rose-500" : ""}`} />
          </button>
        </div>

        {/* Center Controls & Scrubber */}
        <div className="player-center-controls">
          <div className="player-buttons-row">
            <button
              type="button"
              className={`player-mini-btn ${isShuffle ? "text-purple-400" : "text-gray-400"}`}
              onClick={() => setIsShuffle(!isShuffle)}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="player-mini-btn text-gray-200 hover:text-white"
              onClick={handlePrev}
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              className="player-play-btn"
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              className="player-mini-btn text-gray-200 hover:text-white"
              onClick={handleNext}
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              type="button"
              className={`player-mini-btn ${isLooping ? "text-purple-400" : "text-gray-400"}`}
              onClick={() => setIsLooping(!isLooping)}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Time & Progress bar */}
          <div className="player-progress-container">
            <span className="player-time">{formatTime(currentTime)}</span>
            <div className="player-slider-track">
              <input
                type="range"
                min="0"
                max={trackDuration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="player-slider-input"
              />
              <div
                className="player-slider-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="player-time">
              {formatTime(trackDuration)}
            </span>
          </div>
        </div>

        {/* Volume & Fullscreen Toggle */}
        <div className="player-right-controls">
          <div className="player-volume-box">
            <button
              type="button"
              onClick={toggleMute}
              className="player-mini-btn text-gray-300 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="player-volume-slider"
            />
          </div>

          <button
            type="button"
            className="player-mini-btn text-gray-400 hover:text-white hidden sm:block"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse player" : "Expand player"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default MusicPlayer;
