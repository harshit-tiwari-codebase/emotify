import { useEffect, useRef, useState } from "react";
import {
  attachCameraStream,
  classifyEmotion,
  getFaceLandmarker,
  stopCameraStream,
} from "./expressionUtils";

const FaceExpression = () => {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);

  const [emotion, setEmotion] = useState(
    "Click the button to detect your expression",
  );
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  const ensureModelAndCamera = async () => {
    if (!faceLandmarkerRef.current) {
      faceLandmarkerRef.current = await getFaceLandmarker();
    }

    if (!streamRef.current) {
      streamRef.current = await attachCameraStream(videoRef.current);
    }
  };

  const handleDetectClick = async () => {
    try {
      setError("");
      setLoading(true);
      setAnalyzing(true);
      setEmotion("Analyzing face...");

      await ensureModelAndCamera();

      if (!videoRef.current || !faceLandmarkerRef.current) {
        throw new Error("Camera or model is not ready.");
      }

      if (videoRef.current.readyState < 2) {
        await new Promise((resolve) => {
          videoRef.current.onloadeddata = resolve;
        });
      }

      const results = faceLandmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now(),
      );

      const blendShapes = results.faceBlendshapes?.[0]?.categories || [];

      if (!blendShapes.length) {
        setEmotion("No face detected");
        return;
      }

      setEmotion(classifyEmotion(blendShapes));
    } catch (detectError) {
      console.error(detectError);
      setEmotion("Camera or model error");
      setError("Allow camera access and try again.");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(60, 60, 90, 0.35), transparent 36%), linear-gradient(180deg, #0b1020 0%, #070b14 100%)",
        color: "#f3f5fb",
        padding: "48px 20px",
        boxSizing: "border-box",
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "28px",
          borderRadius: "24px",
          background: "rgba(10, 14, 28, 0.82)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(18px)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "8px", fontSize: "2.2rem" }}>
          Moodify Emotion Detector
        </h1>
        <p style={{ marginTop: 0, marginBottom: "24px", color: "#b9c3dd" }}>
          Click the button to open the camera and read your expression once.
        </p>

        <div style={{ margin: "20px 0" }}>
          <button
            type="button"
            onClick={handleDetectClick}
            disabled={loading || analyzing}
            style={{
              padding: "14px 22px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "999px",
              background:
                loading || analyzing
                  ? "linear-gradient(135deg, #4a5568, #2d3748)"
                  : "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "#fff",
              cursor: loading || analyzing ? "not-allowed" : "pointer",
              fontWeight: 700,
              letterSpacing: "0.02em",
              boxShadow:
                loading || analyzing
                  ? "none"
                  : "0 12px 30px rgba(37, 99, 235, 0.35)",
            }}
          >
            {analyzing ? "Detecting..." : "Detect Emotion"}
          </button>
        </div>

        {loading && (
          <p style={{ color: "#b9c3dd" }}>Starting camera and model...</p>
        )}
        {error && <p style={{ color: "#ff8fa3" }}>{error}</p>}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            maxHeight: "420px",
            objectFit: "cover",
            borderRadius: "18px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "#02040a",
            boxShadow: "0 14px 40px rgba(0, 0, 0, 0.35)",
          }}
        />

        <div
          style={{
            marginTop: "20px",
            padding: "18px",
            background: "rgba(255, 255, 255, 0.04)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.6rem" }}>{emotion}</h2>
        </div>
      </div>
    </div>
  );
};

export default FaceExpression;
