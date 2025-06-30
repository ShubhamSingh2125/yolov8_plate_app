from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from yolov8_model import predict_image

app = FastAPI()

# Serve static files (JS/CSS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# HTML template folder
templates = Jinja2Templates(directory="templates")

# Serve index.html
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API route
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    detections = predict_image(image_bytes)
    return {"detections": detections}
