import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
# mp_drawing = mp.solutions.drawing_utils
# mp_drawing_styles = mp.solutions.drawing_styles

face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False)

cap = cv2.VideoCapture(0)

def is_head_looking_down(landmarks, image_height):
    nose_tip = landmarks[1]
    forehead = landmarks[10]
    chin = landmarks[152]

    nose_y = nose_tip.y * image_height
    forehead_y = forehead.y * image_height
    chin_y = chin.y * image_height

    return (nose_y - forehead_y) > (chin_y - nose_y)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            h, w, _ = frame.shape
            if is_head_looking_down(face_landmarks.landmark, h):
                cv2.putText(frame, "Looking Down", (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            else:
                cv2.putText(frame, "Looking Straight", (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Head Pose Detector", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
