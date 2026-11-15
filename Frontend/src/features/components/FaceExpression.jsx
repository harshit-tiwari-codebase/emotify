import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Sparkles,
  Zap,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import {
  attachCameraStream,
  classifyEmotionDetailed,
  getFaceLandmarker,
  stopCameraStream,
  MOOD_DEFINITIONS,
} from "../utils/expressionUtils";

const FaceExpression = ({ onMoodChange, currentMood }) => {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [detectedResult, setDetectedResult] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);

  const cleanupCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsLiveTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera]);

  const initModel = async () => {
    if (!faceLandmarkerRef.current) {
      setIsLoadingModel(true);
      faceLandmarkerRef.current = await getFaceLandmarker();
      setIsLoadingModel(false);
    }
    return faceLandmarkerRef.current;
  };

  const startCamera = async () => {
    try {
      setError("");
      setIsLoadingModel(true);
      await initModel();

      if (!streamRef.current) {
        streamRef.current = await attachCameraStream(videoRef.current);
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error(err);
      setError("Please allow webcam access in your browser settings to detect emotions.");
      setIsCameraActive(false);
    } finally {
      setIsLoadingModel(false);
    }
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      cleanupCamera();
    } else {
      await startCamera();
    }
  };

  // Perform single frame detection
  const detectFrame = useCallback(() => {
    if (
      !videoRef.current ||
      !faceLandmarkerRef.current ||
      videoRef.current.readyState < 2
    ) {
      return null;
    }

    const video = videoRef.current;
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const results = faceLandmarkerRef.current.detectForVideo(
        video,
        performance.now()
      );

      const blendShapes = results.faceBlendshapes?.[0]?.categories || [];
      if (blendShapes.length > 0) {
        setFaceDetected(true);
        const detailed = classifyEmotionDetailed(blendShapes);
        setDetectedResult(detailed);
        return detailed;
      } else {
        setFaceDetected(false);
        return null;
      }
    }
    return null;
  }, []);

  // Single Snap Detection
  const handleSingleDetect = async () => {
    try {
      setError("");
      setAnalyzing(true);

      if (!isCameraActive) {
        await startCamera();
      }

      // Small pause to let camera stabilize
      await new Promise((res) => setTimeout(res, 400));

      const detailed = detectFrame();
      if (detailed) {
        if (onMoodChange) {
          onMoodChange(detailed);
        }
      } else {
        setError("No face detected in frame. Look towards the webcam and try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze facial expression. Please retry.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Live Continuous Tracking Loop
  const runLiveLoop = useCallback(() => {
    const detailed = detectFrame();
    if (detailed && onMoodChange) {
      // Throttle or pass detected mood
      onMoodChange(detailed, false); // false = don't force restart song unless mood changes
    }
    animFrameRef.current = requestAnimationFrame(runLiveLoop);
  }, [detectFrame, onMoodChange]);

  const toggleLiveTracking = async () => {
    if (isLiveTracking) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setIsLiveTracking(false);
    } else {
      if (!isCameraActive) {
        await startCamera();
      }
      setIsLiveTracking(true);
      animFrameRef.current = requestAnimationFrame(runLiveLoop);
    }
  };

  const activeMoodDef =
    detectedResult ||
    (currentMood ? MOOD_DEFINITIONS[currentMood.toLowerCase()] : null) ||
    MOOD_DEFINITIONS.neutral;

  return (
    <div className="face-detector-card">
      {/* Header bar */}
      <div className="detector-header">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="detector-title">AI Facial Emotion Scanner</h3>
        </div>

        <div className="flex items-center gap-2">
          {isCameraActive && (
            <span className="live-pill">
              <span className="live-dot" />
              {isLiveTracking ? "Live Tracking" : "Camera On"}
            </span>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="video-viewport-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`video-viewport ${!isCameraActive ? "hidden" : ""}`}
        />

        {!isCameraActive && (
          <div className="video-placeholder">
            <Camera className="w-12 h-12 text-slate-500 mb-3" />
            <h4 className="text-base font-semibold text-slate-200">Camera is Sleeping</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Start your webcam to scan facial expressions and match instant mood soundscapes.
            </p>
            <button
              type="button"
              className="mt-4 button button--primary text-sm flex items-center gap-2"
              onClick={startCamera}
              disabled={isLoadingModel}
            >
              {isLoadingModel ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading AI Model...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Activate Camera</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Live scanning overlay line */}
        {(analyzing || isLiveTracking) && isCameraActive && (
          <div className="scanner-line-anim" />
        )}

        {/* Face detected status chip on top of video */}
        {isCameraActive && (
          <div className="video-status-badge">
            {faceDetected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Face Detected
              </span>
            ) : (
              <span className="text-slate-400">Position face in frame</span>
            )}
          </div>
        )}
      </div>

      {error && <p className="error-banner">{error}</p>}

      {/* Action Controls */}
      <div className="detector-actions-row">
        <button
          type="button"
          onClick={handleSingleDetect}
          disabled={isLoadingModel || analyzing}
          className="button button--primary flex-1 flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Face...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Scan Emotion Once</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={toggleLiveTracking}
          disabled={isLoadingModel}
          className={`button ${isLiveTracking ? "button--accent" : "button--ghost"} flex items-center justify-center gap-2`}
        >
          <Zap className={`w-4 h-4 ${isLiveTracking ? "text-amber-300" : ""}`} />
          <span>{isLiveTracking ? "Pause Live" : "Live Stream Mode"}</span>
        </button>

        {isCameraActive && (
          <button
            type="button"
            onClick={toggleCamera}
            className="button button--ghost px-3 text-slate-400 hover:text-rose-400"
            title="Turn camera off"
          >
            <CameraOff className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Detected Result Card */}
      {detectedResult && (
        <div className="detected-vibe-summary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{activeMoodDef.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                    Detected Mood
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {detectedResult.confidence}% Confidence
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white">{activeMoodDef.label}</h4>
              </div>
            </div>

            <button
              type="button"
              className="button button--ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
              onClick={() => onMoodChange && onMoodChange(detectedResult, true)}
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Apply Playlist</span>
            </button>
          </div>

          {/* Mini Blendshape Score Bars */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-800/80">
            {Object.entries(detectedResult.scores || {})
              .filter(([k]) => k !== "neutral")
              .map(([key, score]) => {
                const def = MOOD_DEFINITIONS[key] || {};
                const pct = Math.round(score * 100);
                return (
                  <div key={key} className="score-mini-col">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>{def.emoji}</span>
                      <span className="truncate">{def.label}</span>
                    </span>
                    <div className="score-mini-track">
                      <div
                        className="score-mini-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: def.color || "#a855f7",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{pct}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceExpression;
