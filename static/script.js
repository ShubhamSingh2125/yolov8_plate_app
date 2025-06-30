async function uploadImage() {
    const input = document.getElementById('imageInput');
    const file = input.files[0];
    if (!file) return alert("Please select an image");

    // Read image for display
    const reader = new FileReader();
    reader.onload = async function (e) {
        const img = new Image();
        img.onload = async function () {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Send image to backend
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("http://127.0.0.1:8000/predict/", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            const detections = data.detections;

            // Draw boxes
            detections.forEach(d => {
                const [x1, y1, x2, y2] = d.bbox;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

                ctx.fillStyle = "red";
                ctx.font = "16px Arial";
                ctx.fillText(`${d.class_name} (${(d.confidence * 100).toFixed(1)}%)`, x1, y1 - 5);
            });

            document.getElementById('results').innerText = `Detections: ${detections.length}`;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
