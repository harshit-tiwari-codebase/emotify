import { useState, useEffect, useCallback, useRef } from "react";
import FaceExpression from "./features/components/FaceExpression";
import AuthPanel from "./features/auth/components/AuthPanel";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import MoodPlaylist from "./features/music/components/MoodPlaylist";
import MusicPlayer from "./features/music/components/MusicPlayer";
import DashboardModal from "./features/dashboard/components/DashboardModal";
import {
  fetchTracksByMood,
  toggleFavoriteTrack,
  logMoodSession,
  fetchMoodHistory,
  fetchFavorites,
} from "./features/music/services/musicService";
import { MOOD_DEFINITIONS } from "./features/utils/expressionUtils";
import { LogOut, BarChart2, Radio, Heart } from "lucide-react";
import gsap from "gsap";
import "./App.css";

const App = () => {
  const { user, isBootstrapping, isSubmitting, logout } = useAuth();

  // Mood and playlist state
  const [currentMood, setCurrentMood] = useState("happy");
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const mainStageRef = useRef(null);
  const lastLoggedMoodRef = useRef("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Load tracks for a specific mood
  const loadMoodTracks = useCallback(async (moodKey, autoPlayFirst = false) => {
    try {
      const data = await fetchTracksByMood(moodKey);
      if (data && data.tracks) {
        setPlaylist(data.tracks);
        if (data.tracks.length > 0) {
          if (autoPlayFirst || !currentTrack) {
            setCurrentTrack(data.tracks[0]);
            setIsPlaying(true);
          }
        }
      }
    } catch (err) {
      console.warn("Could not load mood tracks:", err.message);
    }
  }, [currentTrack]);

  // Initial data load when user logs in
  useEffect(() => {
    if (!user) return;

    loadMoodTracks(currentMood, false);

    fetchFavorites()
      .then((res) => {
        if (res.favorites) setFavorites(res.favorites);
      })
      .catch(() => {});

    fetchMoodHistory()
      .then((res) => {
        if (res.history) setMoodHistory(res.history);
      })
      .catch(() => {});
  }, [user, currentMood, loadMoodTracks]);

  // Handle emotion detected from FaceLandmarker
  const handleMoodDetected = useCallback(
    async (moodResult, forceRestart = false) => {
      if (!moodResult || !moodResult.key) return;

      const detectedKey = moodResult.key.toLowerCase();
      const prevMood = currentMood.toLowerCase();

      setCurrentMood(detectedKey);

      // Log session to backend if mood changed or first time
      if (lastLoggedMoodRef.current !== detectedKey) {
        lastLoggedMoodRef.current = detectedKey;
        try {
          await logMoodSession(detectedKey, (moodResult.confidence || 75) / 100);
          fetchMoodHistory().then((res) => {
            if (res.history) setMoodHistory(res.history);
          });
          showToast(`Mood identified: ${moodResult.emoji} ${moodResult.label}`);
        } catch (e) {
          // ignore
        }
      }

      if (detectedKey !== prevMood || forceRestart) {
        loadMoodTracks(detectedKey, true);

        // Smooth background pulse animation with gsap
        if (mainStageRef.current) {
          gsap.fromTo(
            mainStageRef.current,
            { opacity: 0.85 },
            { opacity: 1, duration: 0.5, ease: "power2.out" }
          );
        }
      }
    },
    [currentMood, loadMoodTracks]
  );

  // Manual mood selection
  const handleManualMoodSelect = (moodKey) => {
    setCurrentMood(moodKey);
    loadMoodTracks(moodKey, true);
    showToast(`Switched mood to ${MOOD_DEFINITIONS[moodKey]?.label || moodKey}`);
  };

  // Toggle favorite
  const handleToggleFavorite = async (track) => {
    try {
      const res = await toggleFavoriteTrack(track);
      if (res && res.favorites) {
        setFavorites(res.favorites);
        showToast(res.isFavorited ? "Added to your favorites ❤️" : "Removed from favorites");
      }
    } catch (err) {
      console.warn("Favorite toggle failed:", err.message);
    }
  };

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  if (isBootstrapping) {
    return (
      <div className="shell shell--loading">
        <div className="panel panel--loading">
          <p className="eyebrow">Emotify</p>
          <h1 className="auth-title">Connecting session...</h1>
          <p className="auth-copy">
            Synchronizing authentication and loading your mood profile.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPanel />;
  }

  const currentMoodDef = MOOD_DEFINITIONS[currentMood.toLowerCase()] || MOOD_DEFINITIONS.neutral;
  const isCurrentTrackFavorited =
    currentTrack &&
    favorites.some((f) => (f.trackId || f.id) === (currentTrack.id || currentTrack.trackId));

  return (
    <div ref={mainStageRef} className="app-stage">
      {/* Top Navigation Bar */}
      <header className="app-navbar">
        <div className="brand-box" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="brand-logo-icon">🎧</div>
          <span className="brand-title">Emotify</span>
        </div>

        {/* Current Mood Pill in Nav */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="text-slate-400">Vibe:</span>
          <span className="text-white flex items-center gap-1">
            <span>{currentMoodDef.emoji}</span>
            <span>{currentMoodDef.label}</span>
          </span>
        </div>

        {/* User profile & Stats & Logout */}
        <div className="nav-actions">
          <button
            type="button"
            className="user-profile-badge"
            onClick={() => setIsDashboardOpen(true)}
            title="Open Mood Analytics & Favorites"
          >
            <div className="user-avatar-tiny">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name-text hidden md:inline">{user.username}</span>
            <BarChart2 className="w-4 h-4 text-purple-400 ml-0.5" />
          </button>

          <button
            type="button"
            className="button button--ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-slate-300 hover:text-rose-400"
            onClick={logout}
            disabled={isSubmitting}
            title="Sign out of Emotify"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSubmitting ? "Signing out..." : "Logout"}</span>
          </button>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-purple-900/90 border border-purple-500/40 text-white text-xs font-medium shadow-2xl backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Grid: Face Detector + Mood Playlist */}
      <main className="main-content-layout">
        {/* Left Column: Emotion Detection */}
        <FaceExpression
          currentMood={currentMood}
          onMoodChange={handleMoodDetected}
        />

        {/* Right Column: Dynamic Mood Playlist */}
        <MoodPlaylist
          mood={currentMood}
          tracks={playlist}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTrackSelect={handleTrackSelect}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectMoodManually={handleManualMoodSelect}
        />
      </main>

      {/* Persistent Docked Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        playlist={playlist}
        onTrackSelect={handleTrackSelect}
        isFavorited={isCurrentTrackFavorited}
        onToggleFavorite={handleToggleFavorite}
        detectedMood={currentMoodDef.label}
      />

      {/* Mood Analytics & Saved Favorites Dashboard Modal */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        user={user}
        moodHistory={moodHistory}
        favorites={favorites}
        onPlayTrack={handleTrackSelect}
        onRemoveFavorite={handleToggleFavorite}
      />
    </div>
  );
};

const AppRoot = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppRoot;
