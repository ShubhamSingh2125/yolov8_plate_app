from ultralytics import YOLO
import cv2
import numpy as np

# Load your trained model
#model_path = "C:/Users/KIIT0001/Desktop/PM/root/v2/runs/detect/train2/weights/best.pt"
#model = YOLO(model_path)
model = YOLO("best.pt")
model_path = "best.pt"


def predict_image(image_bytes: bytes):
    # Convert bytes to OpenCV image
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Run YOLOv8 inference
    results = model(img)

    # Extract detection results
    detections = []
    for box in results[0].boxes:
        xyxy = box.xyxy[0].tolist()
        conf = box.conf[0].item()
        cls = box.cls[0].item()
        detections.append({
            "bbox": xyxy,
            "confidence": conf,
            "class_id": cls,
            "class_name": model.names[int(cls)]
        })

    return detections
