import { Play, Pause, Heart, Sparkles, Clock } from "lucide-react";
import { MOOD_DEFINITIONS } from "../../utils/expressionUtils";

const MoodPlaylist = ({
  mood,
  tracks = [],
  currentTrack,
  isPlaying,
  onTrackSelect,
  favorites = [],
  onToggleFavorite,
  onSelectMoodManually,
}) => {
  const currentMoodDef = MOOD_DEFINITIONS[mood.toLowerCase()] || MOOD_DEFINITIONS.neutral;
  const favoriteIds = new Set(favorites.map((f) => f.trackId || f.id));

  return (
    <div className="playlist-container">
      {/* Mood Header Banner */}
      <div className="mood-header-card">
        <div className="mood-badge-row">
          <span className="mood-emoji-avatar">{currentMoodDef.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="mood-eyebrow">Current Vibe</span>
              <span className="mood-tag-pill">{currentMoodDef.label}</span>
            </div>
            <h2 className="mood-headline">{currentMoodDef.label} Playlist</h2>
            <p className="mood-description">{currentMoodDef.description}</p>
          </div>
        </div>

        {/* Quick Mood Manual Selectors */}
        <div className="mood-pills-selector">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">
            Explore other vibes:
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.values(MOOD_DEFINITIONS).map((def) => {
              const isActive = def.key === mood.toLowerCase();
              return (
                <button
                  key={def.key}
                  type="button"
                  onClick={() => onSelectMoodManually && onSelectMoodManually(def.key)}
                  className={`mood-filter-chip ${isActive ? "mood-filter-chip--active" : ""}`}
                >
                  <span>{def.emoji}</span>
                  <span>{def.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tracks Table / List */}
      <div className="tracks-list-card">
        <div className="tracks-list-header">
          <div className="col-index">#</div>
          <div className="col-title">Title</div>
          <div className="col-genre hidden md:block">Genre</div>
          <div className="col-bpm hidden sm:block">BPM</div>
          <div className="col-duration">
            <Clock className="w-4 h-4 inline" />
          </div>
          <div className="col-actions"></div>
        </div>

        <div className="tracks-body">
          {tracks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400 opacity-60" />
              <p>No tracks loaded for this mood yet. Try selecting another mood above!</p>
            </div>
          ) : (
            tracks.map((track, index) => {
              const trackId = track.id || track.trackId;
              const isSelected = (currentTrack?.id || currentTrack?.trackId) === trackId;
              const isFav = favoriteIds.has(trackId);

              return (
                <div
                  key={trackId || index}
                  className={`track-row ${isSelected ? "track-row--active" : ""}`}
                  onClick={() => onTrackSelect(track)}
                >
                  <div className="col-index">
                    <span className="track-index-num">{index + 1}</span>
                    <button
                      type="button"
                      className="track-play-inline-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackSelect(track);
                      }}
                    >
                      {isSelected && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current text-purple-400" />
                      ) : (
                        <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="col-title flex items-center gap-3">
                    <img
                      src={track.artwork || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80"}
                      alt={track.title}
                      className="track-thumb-img"
                    />
                    <div className="min-w-0">
                      <p className={`track-title-text ${isSelected ? "text-purple-400 font-semibold" : ""}`}>
                        {track.title}
                      </p>
                      <p className="track-artist-text">{track.artist}</p>
                    </div>
                  </div>

                  <div className="col-genre hidden md:block">
                    <span className="genre-pill">{track.genre || "Pop"}</span>
                  </div>

                  <div className="col-bpm hidden sm:block text-xs text-gray-400">
                    {track.bpm ? `${track.bpm} BPM` : "--"}
                  </div>

                  <div className="col-duration text-xs text-gray-400">
                    {track.duration || "3:00"}
                  </div>

                  <div className="col-actions">
                    <button
                      type="button"
                      className={`track-fav-btn ${isFav ? "text-rose-500 fill-rose-500" : "text-gray-500 hover:text-white"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track);
                      }}
                      title={isFav ? "Favorited" : "Add to favorites"}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodPlaylist;
