import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const VISION_WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const FACE_LANDMARKER_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";

let cachedLandmarker = null;

export const MOOD_DEFINITIONS = {
  happy: {
    key: "happy",
    label: "Happy",
    emoji: "😊",
    color: "#f59e0b",
    gradient: "from-amber-400 to-orange-500",
    description: "Radiant, cheerful energy detected! Playing upbeat, uplifting melodies.",
  },
  calm: {
    key: "calm",
    label: "Calm",
    emoji: "🌿",
    color: "#10b981",
    gradient: "from-emerald-400 to-teal-600",
    description: "Tranquil & relaxed state. Playing soothing acoustic & ambient soundscapes.",
  },
  energetic: {
    key: "energetic",
    label: "Energetic",
    emoji: "⚡",
    color: "#ec4899",
    gradient: "from-fuchsia-500 to-pink-600",
    description: "High vibe and excitement! Playing high-tempo electronic beats.",
  },
  surprised: {
    key: "surprised",
    label: "Surprised",
    emoji: "😲",
    color: "#8b5cf6",
    gradient: "from-purple-500 to-indigo-600",
    description: "Wide-eyed wonder! Curating cinematic, awe-inspiring arrangements.",
  },
  sad: {
    key: "sad",
    label: "Sad",
    emoji: "🌧️",
    color: "#3b82f6",
    gradient: "from-blue-500 to-indigo-800",
    description: "Gentle comfort & emotional healing. Playing reflective piano and warm lofi.",
  },
  angry: {
    key: "angry",
    label: "Intense",
    emoji: "🔥",
    color: "#ef4444",
    gradient: "from-red-500 to-orange-600",
    description: "High tension & passion. Channeling energy with cathartic rock and heavy bass.",
  },
  neutral: {
    key: "neutral",
    label: "Neutral",
    emoji: "🎧",
    color: "#06b6d4",
    gradient: "from-cyan-400 to-blue-600",
    description: "Balanced, focused state. Playing smooth, non-intrusive focus flow beats.",
  },
};

export const classifyEmotionDetailed = (blendShapes = []) => {
  if (!blendShapes || blendShapes.length === 0) {
    return {
      key: "neutral",
      label: "Neutral",
      emoji: "😐",
      confidence: 50,
      scores: { happy: 0, sad: 0, angry: 0, surprised: 0, calm: 0, energetic: 0, neutral: 1 },
      description: MOOD_DEFINITIONS.neutral.description,
    };
  }

  const getScore = (name) =>
    blendShapes.find((shape) => shape.categoryName === name)?.score || 0;

  const smileLeft = getScore("mouthSmileLeft");
  const smileRight = getScore("mouthSmileRight");
  const avgSmile = (smileLeft + smileRight) / 2;

  const browDownLeft = getScore("browDownLeft");
  const browDownRight = getScore("browDownRight");
  const avgBrowDown = (browDownLeft + browDownRight) / 2;

  const browInnerUp = getScore("browInnerUp");
  const jawOpen = getScore("jawOpen");
  const mouthFrownLeft = getScore("mouthFrownLeft");
  const mouthFrownRight = getScore("mouthFrownRight");
  const avgFrown = (mouthFrownLeft + mouthFrownRight) / 2;
  const mouthShrugLower = getScore("mouthShrugLower");
  const eyeWideLeft = getScore("eyeWideLeft");
  const eyeWideRight = getScore("eyeWideRight");
  const avgEyeWide = (eyeWideLeft + eyeWideRight) / 2;
  const eyeBlinkLeft = getScore("eyeBlinkLeft");
  const eyeBlinkRight = getScore("eyeBlinkRight");

  // Calculate normalized raw scores
  const happyScore = Math.min(1, avgSmile * 1.5 + (avgEyeWide > 0.3 ? 0.2 : 0));
  const surpriseScore = Math.min(1, (jawOpen * 0.7 + avgEyeWide * 0.6 + browInnerUp * 0.5) / 1.3);
  const angryScore = Math.min(1, avgBrowDown * 1.4 + (jawOpen < 0.2 && avgFrown > 0.15 ? 0.2 : 0));
  const sadScore = Math.min(1, avgFrown * 1.2 + mouthShrugLower * 0.8 + browInnerUp * 0.4);
  const energeticScore = Math.min(1, avgSmile > 0.4 && (avgEyeWide > 0.2 || jawOpen > 0.3) ? 0.85 : 0);
  const calmScore = Math.min(1, avgSmile < 0.2 && avgBrowDown < 0.2 && jawOpen < 0.15 && (eyeBlinkLeft > 0.4 || eyeBlinkRight > 0.4) ? 0.7 : 0.3);
  const neutralScore = Math.max(0.1, 1 - Math.max(happyScore, surpriseScore, angryScore, sadScore, energeticScore));

  const scores = {
    happy: parseFloat(happyScore.toFixed(2)),
    surprised: parseFloat(surpriseScore.toFixed(2)),
    angry: parseFloat(angryScore.toFixed(2)),
    sad: parseFloat(sadScore.toFixed(2)),
    energetic: parseFloat(energeticScore.toFixed(2)),
    calm: parseFloat(calmScore.toFixed(2)),
    neutral: parseFloat(neutralScore.toFixed(2)),
  };

  let maxMood = "neutral";
  let maxScore = 0.25; // threshold

  if (scores.happy > 0.35 && scores.happy > maxScore) {
    maxMood = scores.energetic > 0.6 ? "energetic" : "happy";
    maxScore = scores.happy;
  }
  if (scores.surprised > 0.45 && scores.surprised > maxScore) {
    maxMood = "surprised";
    maxScore = scores.surprised;
  }
  if (scores.angry > 0.35 && scores.angry > maxScore) {
    maxMood = "angry";
    maxScore = scores.angry;
  }
  if (scores.sad > 0.35 && scores.sad > maxScore) {
    maxMood = "sad";
    maxScore = scores.sad;
  }

  const moodMeta = MOOD_DEFINITIONS[maxMood] || MOOD_DEFINITIONS.neutral;
  const confidencePercent = Math.min(99, Math.round(Math.max(55, maxScore * 100)));

  return {
    key: moodMeta.key,
    label: moodMeta.label,
    emoji: moodMeta.emoji,
    confidence: confidencePercent,
    scores,
    color: moodMeta.color,
    gradient: moodMeta.gradient,
    description: moodMeta.description,
  };
};

export const classifyEmotion = (blendShapes) => {
  const result = classifyEmotionDetailed(blendShapes);
  return `${result.emoji} ${result.label}`;
};

export const getFaceLandmarker = async () => {
  if (cachedLandmarker) {
    return cachedLandmarker;
  }

  const vision = await FilesetResolver.forVisionTasks(VISION_WASM_PATH);

  cachedLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: FACE_LANDMARKER_MODEL_PATH,
    },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    numFaces: 1,
  });

  return cachedLandmarker;
};

export const attachCameraStream = async (videoElement) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: "user",
    },
    audio: false,
  });

  if (videoElement) {
    videoElement.srcObject = stream;
    await videoElement.play();
  }

  return stream;
};

export const stopCameraStream = (stream) => {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};
