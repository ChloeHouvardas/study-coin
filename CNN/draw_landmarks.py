import cv2
import mediapipe as mp

# Initialize MediaPipe face mesh and drawing utilities
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False)

# Open the webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Webcam not accessible")
    exit()

# TODO might have to change this threshold ratio
def is_looking_down(landmarks, image_height, threshold_ratio=1.6):
    """
    Simple heuristic: if the nose is closer to the chin than to the forehead,
    assume the user is looking down.
    """
    nose = landmarks[1]
    forehead = landmarks[10]
    chin = landmarks[152]

    nose_y = nose.y * image_height
    forehead_y = forehead.y * image_height
    chin_y = chin.y * image_height

    upper = nose_y - forehead_y
    lower = chin_y - nose_y


    return upper > lower * threshold_ratio



while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Flip for mirror effect and convert to RGB
    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    h, w, _ = frame.shape
    status_text = "No face detected"
    color = (200, 200, 200)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            # Draw landmarks on the frame
            # mp_drawing.draw_landmarks(
            #     image=frame,
            #     landmark_list=face_landmarks,
            #     connections=mp_face_mesh.FACEMESH_TESSELATION,
            #     landmark_drawing_spec=None,
            #     connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style()
            # )
            # mp_drawing.draw_landmarks(
            #     image=frame,
            #     landmark_list=face_landmarks,
            #     connections=mp_face_mesh.FACEMESH_CONTOURS,
            #     landmark_drawing_spec=None,
            #     connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_contours_style()
            # )

            # Determine if the head is tilted down
            if is_looking_down(face_landmarks.landmark, h):
                status_text = "Looking Down"
                color = (0, 0, 255)
            else:
                status_text = "Looking Straight"
                color = (0, 255, 0)

    # Draw status text
    cv2.putText(frame, status_text, (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

    # Show the frame
    cv2.imshow("Head Pose Detector", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
