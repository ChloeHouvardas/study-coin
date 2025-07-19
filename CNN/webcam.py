import cv2
from ultralytics import YOLO

model = YOLO('yolov8n.pt')

# if u have multiple cameras u might have to change index
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Webcam not accessible")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        # maybe add break here

    results = model(frame, verbose=False)[0]

    detected_labels = [model.model.names[int(cls)] for cls in results.boxes.cls]

    # studying = "person" in detected_labels and ("laptop" in detected_labels or "book" in detected_labels) and "cell phone" not in detected_labels
    studying = "person" in detected_labels # and ("laptop" in detected_labels or "book" in detected_labels) and "cell phone" not in detected_labels
    status = "Studying" if studying else "Not Studying"

    annotated_frame = results.plot()
    cv2.putText(annotated_frame, status, (20,40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0) if studying else (0,0,255), 3)

    cv2.imshow("Study Detector", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()