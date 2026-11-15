import { useState } from "react";
import { X, BarChart3, Heart, Info, Play, Trash2, Calendar, Smile } from "lucide-react";
import { MOOD_DEFINITIONS } from "../../utils/expressionUtils";

const DashboardModal = ({
  isOpen,
  onClose,
  user,
  moodHistory = [],
  favorites = [],
  onPlayTrack,
  onRemoveFavorite,
}) => {
  const [activeTab, setActiveTab] = useState("analytics");

  if (!isOpen) return null;

  // Calculate mood distribution
  const totalScans = moodHistory.length;
  const moodCounts = moodHistory.reduce((acc, curr) => {
    const key = (curr.emotion || "neutral").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="avatar-circle">
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="modal-title">{user?.username}&apos;s Mood Center</h3>
              <p className="modal-subtitle">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button
            type="button"
            className={`modal-tab ${activeTab === "analytics" ? "modal-tab--active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Mood Analytics</span>
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === "favorites" ? "modal-tab--active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            <Heart className="w-4 h-4" />
            <span>Favorites ({favorites.length})</span>
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === "info" ? "modal-tab--active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <Info className="w-4 h-4" />
            <span>About Emotify</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="modal-body">
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="stat-card">
                  <span className="stat-num">{totalScans}</span>
                  <span className="stat-label">Total Face Scans</span>
                </div>
                <div className="stat-card">
                  <span className="stat-num">
                    {Object.keys(moodCounts).length > 0
                      ? MOOD_DEFINITIONS[Object.keys(moodCounts)[0]]?.emoji || "✨"
                      : "😊"}
                  </span>
                  <span className="stat-label">Frequent Mood</span>
                </div>
                <div className="stat-card col-span-2 sm:col-span-1">
                  <span className="stat-num">{favorites.length}</span>
                  <span className="stat-label">Saved Tracks</span>
                </div>
              </div>

              {/* Mood Distribution */}
              <div className="analytics-card">
                <h4 className="analytics-card-title flex items-center gap-2">
                  <Smile className="w-4 h-4 text-purple-400" />
                  <span>Emotion Breakdown</span>
                </h4>
                <div className="space-y-3 mt-3">
                  {Object.entries(MOOD_DEFINITIONS).map(([key, def]) => {
                    const count = moodCounts[key] || 0;
                    const percent = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-300">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span>{def.emoji}</span>
                            <span>{def.label}</span>
                          </span>
                          <span className="text-gray-400 font-mono">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: def.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Scan Timeline */}
              <div className="analytics-card">
                <h4 className="analytics-card-title flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Recent Mood Log</span>
                </h4>
                {moodHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 mt-2">
                    No face scans logged yet. Try detecting your emotion on the main screen!
                  </p>
                ) : (
                  <div className="history-timeline mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {moodHistory.slice(0, 10).map((entry, idx) => {
                      const moodKey = (entry.emotion || "neutral").toLowerCase();
                      const def = MOOD_DEFINITIONS[moodKey] || MOOD_DEFINITIONS.neutral;
                      const dateStr = entry.detectedAt
                        ? new Date(entry.detectedAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now";

                      return (
                        <div key={idx} className="timeline-row">
                          <span className="text-base">{def.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-xs text-gray-200">
                              {def.label}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              {dateStr}
                            </span>
                          </div>
                          {entry.confidence && (
                            <span className="text-[11px] text-purple-300 font-mono">
                              {Math.round(entry.confidence * 100)}% Match
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div>
              {favorites.length === 0 ? (
                <div className="empty-state text-center py-10">
                  <Heart className="w-10 h-10 text-gray-500 mx-auto mb-2 opacity-50" />
                  <p className="text-gray-300 font-medium">No favorite tracks yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click the heart icon on any song in the playlist to save it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {favorites.map((fav, index) => (
                    <div key={fav.trackId || index} className="favorite-item-row">
                      <img
                        src={fav.artwork || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80"}
                        alt={fav.title}
                        className="fav-thumb"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-100 truncate">{fav.title}</p>
                        <p className="text-xs text-gray-400 truncate">{fav.artist}</p>
                      </div>
                      <span className="fav-mood-tag">{fav.mood}</span>
                      <button
                        type="button"
                        className="fav-action-btn text-purple-400 hover:text-purple-300"
                        onClick={() => {
                          onPlayTrack(fav);
                          onClose();
                        }}
                        title="Play"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        type="button"
                        className="fav-action-btn text-gray-400 hover:text-rose-400"
                        onClick={() => onRemoveFavorite(fav)}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "info" && (
            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl">
                <h5 className="font-bold text-sm text-purple-300 mb-1">How Emotify Works</h5>
                <p>
                  Emotify combines real-time facial landmark detection with intelligent mood-based audio curation.
                  Using Google&apos;s MediaPipe Vision WASM models running purely client-side in your browser, your webcam feed is scanned for 52 facial blendshapes (smiles, brow furrows, jaw drops, eye widening).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl">
                  <h6 className="font-bold text-gray-200 mb-1">Privacy First</h6>
                  <p className="text-gray-400">
                    Your camera stream never leaves your device. All computer vision inference executes directly inside your browser via WebAssembly.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl">
                  <h6 className="font-bold text-gray-200 mb-1">Adaptive Soundscapes</h6>
                  <p className="text-gray-400">
                    Matches your detected emotional state to curated acoustic, lofi, energetic, and soothing musical profiles with one tap.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
