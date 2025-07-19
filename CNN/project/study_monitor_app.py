import os
import time
import cv2
from dotenv import load_dotenv
from evidence_capture import EvidenceCapture
from study_analyzer import StudyAnalyzer

class StudyMonitorApp:
    def __init__(self):
        load_dotenv()
        self.webhook_url = os.getenv('DISCORD_WEBHOOK')
        self.capture = EvidenceCapture(self.webhook_url)
        self.analyzer = StudyAnalyzer()
        self.cap = cv2.VideoCapture(0)
        self.threshold_seconds = 10
        self.not_studying_start = None

        if not self.cap.isOpened():
            print("❌ Webcam not accessible")
            exit()

    def run(self) -> None:
        while True:
            ret, frame = self.cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            studying, yolo_result = self.analyzer.analyze(frame)

            countdown = None
            if not studying:
                if self.not_studying_start is None:
                    self.not_studying_start = time.time()
                elapsed = time.time() - self.not_studying_start
                countdown = max(0, int(self.threshold_seconds - elapsed))

                if elapsed >= self.threshold_seconds:
                    photo = self.capture.take_photo(frame)
                    self.capture.send_to_discord("🚨 User distracted", photo)
                    self.cleanup()
                    self.capture.show_popup()
                    break
            else:
                self.not_studying_start = None

            # Annotate & display
            annotated = yolo_result.plot()
            status = "Studying" if studying else "Not Studying"
            color = (0, 255, 0) if studying else (0, 0, 255)
            cv2.putText(annotated, status, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

            if countdown is not None:
                cv2.putText(annotated, f"⚠️ Focus in {countdown}s", (20, 90),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            cv2.imshow("Study Monitor", annotated)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        self.cleanup()

    def cleanup(self):
        self.cap.release()
        cv2.destroyAllWindows()