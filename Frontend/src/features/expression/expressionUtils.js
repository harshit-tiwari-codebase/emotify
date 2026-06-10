import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const VISION_WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const FACE_LANDMARKER_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";

export const classifyEmotion = (blendShapes) => {
  const smileLeft =
    blendShapes.find((shape) => shape.categoryName === "mouthSmileLeft")
      ?.score || 0;
  const smileRight =
    blendShapes.find((shape) => shape.categoryName === "mouthSmileRight")
      ?.score || 0;
  const browDown =
    blendShapes.find((shape) => shape.categoryName === "browDownLeft")
      ?.score || 0;
  const jawOpen =
    blendShapes.find((shape) => shape.categoryName === "jawOpen")?.score || 0;

  if (smileLeft > 0.5 || smileRight > 0.5) {
    return "😊 Happy";
  }

  if (browDown > 0.4) {
    return "😠 Angry";
  }

  if (jawOpen > 0.6) {
    return "😲 Surprised";
  }

  return "😐 Neutral";
};

export const getFaceLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(VISION_WASM_PATH);

  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: FACE_LANDMARKER_MODEL_PATH,
    },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    numFaces: 1,
  });
};

export const attachCameraStream = async (videoElement) => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });

  if (!videoElement) {
    return stream;
  }

  videoElement.srcObject = stream;
  await videoElement.play();

  return stream;
};

export const stopCameraStream = (stream) => {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => track.stop());
};