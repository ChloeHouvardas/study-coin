import os
import time
import cv2
import requests
import tkinter as tk
from tkinter import messagebox

class EvidenceCapture:
    def __init__(self, webhook_url: str, photo_folder: str = "CNN/photos"):
        self.webhook_url = webhook_url
        self.photo_folder = photo_folder

    def take_photo(self, frame) -> str:
        os.makedirs(self.photo_folder, exist_ok=True)
        timestamp = int(time.time())
        filename = os.path.join(self.photo_folder, f"distraction_capture_{timestamp}.jpg")
        cv2.imwrite(filename, frame)
        print(f"📸 Image saved to: {filename}")
        return filename

    def send_to_discord(self, message: str, image_path: str = None) -> None:
        data = {"content": message}
        files = {}

        if image_path and os.path.exists(image_path):
            files["file"] = (os.path.basename(image_path), open(image_path, "rb"))

        response = requests.post(self.webhook_url, data=data, files=files)
        if response.status_code in [200, 204]:
            print("✅ Discord message sent successfully.")
        else:
            print(f"❌ Failed to send Discord message: {response.status_code}")

    @staticmethod
    def show_popup() -> None:
        root = tk.Tk()
        root.withdraw()
        messagebox.showwarning("⚠️ Study goal failed!")
        root.destroy()