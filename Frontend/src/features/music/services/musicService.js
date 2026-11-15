const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || "Music service request failed");
  }

  return payload;
};

export const fetchTracksByMood = (mood) =>
  request(`/api/music/mood/${encodeURIComponent(mood)}`, { method: "GET" });

export const fetchMoodCategories = () =>
  request("/api/music/categories", { method: "GET" });

export const fetchFavorites = () =>
  request("/api/music/favorites", { method: "GET" });

export const toggleFavoriteTrack = (track) =>
  request("/api/music/favorites", {
    method: "POST",
    body: JSON.stringify({
      trackId: track.id || track.trackId,
      title: track.title,
      artist: track.artist,
      mood: track.mood,
      audioUrl: track.audioUrl,
      artwork: track.artwork,
      duration: track.duration,
    }),
  });

export const logMoodSession = (emotion, confidence, note = "") =>
  request("/api/music/history", {
    method: "POST",
    body: JSON.stringify({ emotion, confidence, note }),
  });

export const fetchMoodHistory = () =>
  request("/api/music/history", { method: "GET" });
