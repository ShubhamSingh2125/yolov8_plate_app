async function uploadImage() {
    const input = document.getElementById("imageInput");
    const file = input.files[0];
    if (!file) {
        alert("Please select an image.");
        return;
    }

    // Read image into canvas
    const reader = new FileReader();
    reader.onload = async function (e) {
        const img = new Image();
        img.onload = async function () {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Send to backend
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/predict/", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                alert("Prediction failed.");
                return;
            }

            const result = await response.json();
            const detections = result.detections;

            // Draw bounding boxes
            detections.forEach(det => {
                const [x1, y1, x2, y2] = det.bbox;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                ctx.font = "16px Arial";
                ctx.fillStyle = "red";
                ctx.fillText(`${det.class_name} (${(det.confidence * 100).toFixed(1)}%)`, x1, y1 - 5);
            });

            document.getElementById("results").innerText = `Detections: ${detections.length}`;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
