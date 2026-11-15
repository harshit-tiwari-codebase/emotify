const userModel = require("../models/user.models");

const MOOD_TRACKS = {
  happy: [
    {
      id: "happy-1",
      title: "Sunny Days",
      artist: "Aerohead",
      mood: "Happy",
      genre: "Indie Pop / Chill",
      duration: "2:45",
      artwork: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=uplifting-day-112196.mp3",
      bpm: 120,
      description: "Bright upbeat acoustic vibes to amplify your cheerful smile.",
    },
    {
      id: "happy-2",
      title: "Joyful Journey",
      artist: "Lumina",
      mood: "Happy",
      genre: "Electro Pop",
      duration: "3:10",
      artwork: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=inspire-59422.mp3",
      bpm: 128,
      description: "Feel-good synth rhythms that keep your spirits soaring high.",
    },
    {
      id: "happy-3",
      title: "Good Vibes Radiance",
      artist: "Sunset Groove",
      mood: "Happy",
      genre: "Tropical House",
      duration: "2:54",
      artwork: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=happy-acoustic-guitar-background-music-111161.mp3",
      bpm: 115,
      description: "Warm guitars and breezy rhythms for sunny celebrations.",
    },
    {
      id: "happy-4",
      title: "Summer Breeze",
      artist: "Melodic Wave",
      mood: "Happy",
      genre: "Acoustic Pop",
      duration: "2:30",
      artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f772dd.mp3?filename=summer-walk-124477.mp3",
      bpm: 124,
      description: "Playful guitar strumming to celebrate good moods.",
    },
  ],
  sad: [
    {
      id: "sad-1",
      title: "Reflections in the Rain",
      artist: "Komorebi",
      mood: "Sad",
      genre: "Lofi / Ambient",
      duration: "3:12",
      artwork: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=sad-piano-ambient-111369.mp3",
      bpm: 72,
      description: "Gentle melancholic piano chords to comfort your emotions.",
    },
    {
      id: "sad-2",
      title: "Healing Solitude",
      artist: "Ethereal Echo",
      mood: "Sad",
      genre: "Neo-Classical",
      duration: "3:40",
      artwork: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447879e9.mp3?filename=alone-with-thoughts-sad-piano-violin-7253.mp3",
      bpm: 68,
      description: "A soft violin and piano ballad to soothe and accompany introspection.",
    },
    {
      id: "sad-3",
      title: "Quiet Moonlight",
      artist: "Nocturne Sound",
      mood: "Sad",
      genre: "Slow Chill",
      duration: "2:50",
      artwork: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/26/audio_d14e3b7b62.mp3?filename=gentle-piano-10700.mp3",
      bpm: 65,
      description: "Calming melodies to give your mind a warm embrace.",
    },
  ],
  calm: [
    {
      id: "calm-1",
      title: "Serenity Flow",
      artist: "Mindful Space",
      mood: "Calm",
      genre: "Deep Ambient",
      duration: "3:30",
      artwork: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e30de.mp3?filename=meditation-piano-peaceful-110481.mp3",
      bpm: 60,
      description: "Deep meditative waves to center your focus and balance.",
    },
    {
      id: "calm-2",
      title: "Lofi Coffee Break",
      artist: "ChillHop Dreamer",
      mood: "Calm",
      genre: "Lofi Beats",
      duration: "2:42",
      artwork: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c93e43d61f.mp3?filename=lofi-study-112191.mp3",
      bpm: 78,
      description: "Mellow vinyl tape warmth for peaceful moments.",
    },
    {
      id: "calm-3",
      title: "Whispering Pines",
      artist: "Natura Soundscapes",
      mood: "Calm",
      genre: "Nature Ambient",
      duration: "3:15",
      artwork: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_d0a13f69d2.mp3?filename=relaxing-mountains-10769.mp3",
      bpm: 62,
      description: "Forest breeze, gentle chimes and calming harmony.",
    },
  ],
  energetic: [
    {
      id: "energetic-1",
      title: "Cybernetic Pulse",
      artist: "Neon Syndicate",
      mood: "Energetic",
      genre: "Synthwave / Cyberpunk",
      duration: "2:55",
      artwork: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_228c2dd045.mp3?filename=action-rock-111162.mp3",
      bpm: 135,
      description: "High-voltage bass and electronic drums to fuel your drive.",
    },
    {
      id: "energetic-2",
      title: "Limitless Velocity",
      artist: "HyperDrive",
      mood: "Energetic",
      genre: "Electronic Dance",
      duration: "3:05",
      artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_82e666a70e.mp3?filename=energetic-hip-hop-8303.mp3",
      bpm: 130,
      description: "Fast-tempo beat drops engineered for peak motivation.",
    },
    {
      id: "energetic-3",
      title: "Apex Horizon",
      artist: "Overdrive",
      mood: "Energetic",
      genre: "Future Bass",
      duration: "2:48",
      artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/18/audio_651a0d8bb6.mp3?filename=workout-electronic-127399.mp3",
      bpm: 138,
      description: "Pumping workout anthem with thrilling rhythm drops.",
    },
  ],
  angry: [
    {
      id: "angry-1",
      title: "Inferno Distortion",
      artist: "Rage Engine",
      mood: "Angry",
      genre: "Industrial Rock",
      duration: "2:40",
      artwork: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_228c2dd045.mp3?filename=action-rock-111162.mp3",
      bpm: 140,
      description: "Heavy distorted riffs to channel intensity and blow off steam.",
    },
    {
      id: "angry-2",
      title: "Shadow Release",
      artist: "Catharsis",
      mood: "Angry",
      genre: "Dark Synth / Alternative",
      duration: "3:02",
      artwork: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_27d7f76ca0.mp3?filename=dark-mystery-trailer-125026.mp3",
      bpm: 126,
      description: "Intense cinematic percussion to transform tension into power.",
    },
  ],
  surprised: [
    {
      id: "surprised-1",
      title: "Wonderland Bloom",
      artist: "Aurora Borealis",
      mood: "Surprised",
      genre: "Cinematic Pop",
      duration: "3:00",
      artwork: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=inspire-59422.mp3",
      bpm: 118,
      description: "Mesmerizing arpeggios that capture awe and thrilling surprise.",
    },
    {
      id: "surprised-2",
      title: "Cosmic Discovery",
      artist: "Starlight Travelers",
      mood: "Surprised",
      genre: "Electronic Chill",
      duration: "2:48",
      artwork: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_38210ce532.mp3?filename=space-atmosphere-112211.mp3",
      bpm: 110,
      description: "Dreamy textures and unexpected melodic ascents.",
    },
  ],
  neutral: [
    {
      id: "neutral-1",
      title: "Smooth Flow State",
      artist: "Urban Lofi Lab",
      mood: "Neutral",
      genre: "Chillhop",
      duration: "2:36",
      artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c93e43d61f.mp3?filename=lofi-study-112191.mp3",
      bpm: 82,
      description: "Balanced, non-intrusive beats ideal for everyday focus.",
    },
    {
      id: "neutral-2",
      title: "Morning Routine",
      artist: "Coffee & Code",
      mood: "Neutral",
      genre: "Easy Listening",
      duration: "2:52",
      artwork: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f772dd.mp3?filename=summer-walk-124477.mp3",
      bpm: 90,
      description: "Smooth background groove for study, coding, or relaxed browsing.",
    },
  ],
};

const normalizeMood = (mood) => {
  if (!mood) return "neutral";
  const m = mood.toLowerCase();
  if (m.includes("happy") || m.includes("joy") || m.includes("smile")) return "happy";
  if (m.includes("sad") || m.includes("cry") || m.includes("grief")) return "sad";
  if (m.includes("angry") || m.includes("frustrated") || m.includes("rage")) return "angry";
  if (m.includes("surpris") || m.includes("shock") || m.includes("wow")) return "surprised";
  if (m.includes("energ") || m.includes("pump") || m.includes("excited")) return "energetic";
  if (m.includes("calm") || m.includes("relax") || m.includes("peace")) return "calm";
  return "neutral";
};

const getTracksByMood = async (req, res) => {
  try {
    const rawMood = req.params.mood;
    const moodKey = normalizeMood(rawMood);
    const tracks = MOOD_TRACKS[moodKey] || MOOD_TRACKS.neutral;

    return res.status(200).json({
      success: true,
      requestedMood: rawMood,
      matchedMood: moodKey,
      count: tracks.length,
      tracks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch mood tracks",
    });
  }
};

const getMoodCategories = async (req, res) => {
  try {
    const categories = [
      {
        id: "happy",
        name: "Happy",
        emoji: "😊",
        gradient: "from-amber-400 to-rose-500",
        tagline: "Feel-good pop & sunny acoustic grooves",
        count: MOOD_TRACKS.happy.length,
      },
      {
        id: "calm",
        name: "Calm",
        emoji: "🌿",
        gradient: "from-teal-400 to-emerald-600",
        tagline: "Relaxing ambient, meditation & deep breath",
        count: MOOD_TRACKS.calm.length,
      },
      {
        id: "energetic",
        name: "Energetic",
        emoji: "⚡",
        gradient: "from-fuchsia-500 to-indigo-600",
        tagline: "High-octane electronic beats & synthwave",
        count: MOOD_TRACKS.energetic.length,
      },
      {
        id: "sad",
        name: "Sad / Healing",
        emoji: "🌧️",
        gradient: "from-blue-600 to-slate-800",
        tagline: "Gentle piano & comforting lofi for your soul",
        count: MOOD_TRACKS.sad.length,
      },
      {
        id: "surprised",
        name: "Surprised",
        emoji: "😲",
        gradient: "from-violet-500 to-pink-500",
        tagline: "Awe-inspiring cinematic sounds and discoveries",
        count: MOOD_TRACKS.surprised.length,
      },
      {
        id: "angry",
        name: "Cathartic / Heavy",
        emoji: "🔥",
        gradient: "from-red-600 to-orange-600",
        tagline: "Intense industrial rock & energy release",
        count: MOOD_TRACKS.angry.length,
      },
      {
        id: "neutral",
        name: "Focus / Chill",
        emoji: "🎧",
        gradient: "from-cyan-500 to-blue-600",
        tagline: "Smooth study and daytime flow beats",
        count: MOOD_TRACKS.neutral.length,
      },
    ];

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      favorites: user.favorites || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { trackId, title, artist, mood, audioUrl, artwork, duration } = req.body;

    if (!trackId) {
      return res.status(400).json({ success: false, message: "trackId is required" });
    }

    const existingIndex = user.favorites.findIndex((f) => f.trackId === trackId);
    let isFavorited = false;

    if (existingIndex > -1) {
      user.favorites.splice(existingIndex, 1);
      isFavorited = false;
    } else {
      user.favorites.push({
        trackId,
        title: title || "Unknown Track",
        artist: artist || "Unknown Artist",
        mood: mood || "Neutral",
        audioUrl: audioUrl || "",
        artwork: artwork || "",
        duration: duration || "3:00",
        savedAt: new Date(),
      });
      isFavorited = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      isFavorited,
      message: isFavorited ? "Saved to favorites" : "Removed from favorites",
      favoritesCount: user.favorites.length,
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const logMoodSession = async (req, res) => {
  try {
    const { emotion, confidence, note } = req.body;

    if (!emotion) {
      return res.status(400).json({ success: false, message: "emotion is required" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.moodHistory.push({
      emotion,
      confidence: typeof confidence === "number" ? confidence : 1.0,
      note: note || "",
      detectedAt: new Date(),
    });

    // Keep up to 100 history items
    if (user.moodHistory.length > 100) {
      user.moodHistory = user.moodHistory.slice(-100);
    }

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Mood logged successfully",
      latestEntry: user.moodHistory[user.moodHistory.length - 1],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMoodHistory = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const history = user.moodHistory || [];
    // Compute quick aggregate stats
    const distribution = history.reduce((acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      totalScans: history.length,
      distribution,
      history: history.slice(-25).reverse(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTracksByMood,
  getMoodCategories,
  getFavorites,
  toggleFavorite,
  logMoodSession,
  getMoodHistory,
};
