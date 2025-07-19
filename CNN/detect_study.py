import os
import cv2
from ultralytics import YOLO
import mediapipe as mp
import cv2
import time
import tkinter as tk
from tkinter import messagebox

# TODO SEPERATE LOGIC INTO DIFFERENT CLASSES

# Load YOLOv8 model
# NOTE this is the smallest model, least accurate but runs best
model = YOLO('yolov8n.pt')

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False)

# Initialize webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Webcam not accessible")
    exit()

# CHECKS IF LOOKING DONW
# TODO might have to change the threshold depending on the person
def is_looking_down(landmarks, image_height, threshold_ratio=1.6):
    nose = landmarks[1]
    forehead = landmarks[10]
    chin = landmarks[152]

    nose_y = nose.y * image_height
    forehead_y = forehead.y * image_height
    chin_y = chin.y * image_height

    upper = nose_y - forehead_y
    lower = chin_y - nose_y

    return upper > lower * threshold_ratio

def show_popup():
    root = tk.Tk()
    root.withdraw()  # Hide main window
    messagebox.showwarning("Study goal failed!")
    root.destroy()

def take_photo(frame, folder="photos"):
    """
    Saves a pic image from the webcam frame to a file.
    Creates the folder if it doesn't exist.
    """
    os.makedirs(folder, exist_ok=True)
    timestamp = int(time.time())
    filename = os.path.join(folder, f"distraction_capture_{timestamp}.jpg")
    cv2.imwrite(filename, frame)
    print(f"Image saved to: {filename}")


# TODO make the time threshold dynamic
not_studying_start_time = None
not_studying_threshold = 10  # seconds

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Flip for mirror effect
    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape

    # === OBJECT DETECTION ===
    yolo_results = model(frame, verbose=False)[0]
    detected_labels = [model.model.names[int(cls)] for cls in yolo_results.boxes.cls]

    # === CHECK IF LOOKING DOWN ===
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_results = face_mesh.process(rgb_frame)

    looking_down = False
    if mp_results.multi_face_landmarks:
        for face_landmarks in mp_results.multi_face_landmarks:
            looking_down = is_looking_down(face_landmarks.landmark, h)
            break  # Only use first face

    # === STUDYING LOGIC ===
    person_present = "person" in detected_labels
    has_focus = "laptop" in detected_labels or "book" in detected_labels
    has_phone = "cell phone" in detected_labels

    # === FINAL DECISION === 
    studying = (
        person_present and
        (has_focus or not looking_down) and
        not has_phone
    )

    # === COUNTDOWN ===
    countdown = None
    if not studying:
        if not not_studying_start_time:
            not_studying_start_time = time.time()
        elapsed = time.time() - not_studying_start_time
        countdown = max(0, int(not_studying_threshold - elapsed))
        if elapsed >= not_studying_threshold:
            take_photo(frame)  # save photo before releasing webcam
            cap.release()
            cv2.destroyAllWindows()
            show_popup()
            break
    else:
        not_studying_start_time = None

    # Annotate Frame
    annotated_frame = yolo_results.plot()
    status = "Studying" if studying else "Not Studying"
    color = (0, 255, 0) if studying else (0, 0, 255)

    cv2.putText(annotated_frame, status, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)


        # Show countdown if not studying
    if countdown is not None:
        timer_text = f"⚠️ Focus in {countdown}s"
        cv2.putText(annotated_frame, timer_text, (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)


    # Show frame
    cv2.imshow("Study Detector", annotated_frame)

    # Quit with 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()