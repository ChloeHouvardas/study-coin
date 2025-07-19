import cv2
import mediapipe as mp
from ultralytics import YOLO

class StudyAnalyzer:
    def __init__(self):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=False)
        self.model = YOLO('yolov8n.pt')

    def _is_looking_down(self, landmarks, image_height, threshold_ratio=1.6) -> bool:
        nose = landmarks[1]
        forehead = landmarks[10]
        chin = landmarks[152]

        upper = (nose.y - forehead.y) * image_height
        lower = (chin.y - nose.y) * image_height
        return upper > lower * threshold_ratio

    def analyze(self, frame) -> tuple[bool, any]:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, _, _ = frame.shape

        face_result = self.face_mesh.process(rgb)
        looking_down = False
        if face_result.multi_face_landmarks:
            looking_down = self._is_looking_down(face_result.multi_face_landmarks[0].landmark, h)

        yolo_result = self.model(frame, verbose=False)[0]
        labels = [self.model.model.names[int(cls)] for cls in yolo_result.boxes.cls]

        person = "person" in labels
        has_focus = "laptop" in labels or "book" in labels
        has_phone = "cell phone" in labels

        studying = person and (has_focus or not looking_down) and not has_phone

        return studying, yolo_result