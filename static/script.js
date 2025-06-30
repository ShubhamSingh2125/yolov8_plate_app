async function uploadImage() {
    const input = document.getElementById("imageInput");
    const file = input.files[0];
    if (!file) {
        alert("Please select an image.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const img = new Image();
        img.onload = async function () {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch("/predict/", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    const err = await response.text();
                    console.error("❌ Backend error:", err);
                    alert("Prediction failed: " + err);
                    return;
                }

                const result = await response.json();
                const detections = result.detections;

                if (!detections || detections.length === 0) {
                    alert("✅ Prediction succeeded, but no objects detected.");
                    return;
                }

                detections.forEach(det => {
                    const [x1, y1, x2, y2] = det.bbox;
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                    ctx.font = "16px Arial";
                    ctx.fillStyle = "red";
                    ctx.fillText(`${det.class_name} (${(det.confidence * 100).toFixed(1)}%)`, x1, y1 - 5);
                });

                // Check if result div exists before updating it
                const resultDiv = document.getElementById("results");
                if (resultDiv) {
                    resultDiv.innerText = `Detections: ${detections.length}`;
                }

            } catch (error) {
                console.error("❌ Unexpected error during prediction:", error);
                // Only alert if the image isn't already drawn
                alert("Prediction failed due to an unexpected error.");
            }
        };
        img.onerror = () => {
            alert("Image failed to load. Please try another file.");
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
