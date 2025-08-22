from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import requests
import base64
from io import BytesIO
from PIL import Image
from graph import ImageClassificationGraph
import config
import uvicorn

# ==============================================================================
# SECTION 1: FASTAPI BACKEND LOGIC
# ==============================================================================

# Initialize FastAPI app
app = FastAPI(
    title="Environmental Image Classification API",
    description="API for classifying images into categories",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://setu-sandy.vercel.app",  # Your deployed frontend URL
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for FastAPI
class ImageRequest(BaseModel):
    image_url: HttpUrl

class ClassificationResponse(BaseModel):
    category: str
    severity: int | None
    severity_level: str | None
    scale: str | None

# Initialize Classification Logic
classifier = ImageClassificationGraph()

# Image Processing Helper Functions
def process_image_to_base64(image_bytes: bytes) -> str:
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        buffer = BytesIO()
        img.save(buffer, format="JPEG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

def download_image(image_url: str) -> bytes:
    try:
        response = requests.get(image_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        response.raise_for_status()
        return response.content
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {e}")

# FastAPI Endpoints
@app.post("/classify", response_model=ClassificationResponse)
async def classify_image_from_url(request: ImageRequest):
    try:
        image_bytes = download_image(str(request.image_url))
        image_base64 = process_image_to_base64(image_bytes)
        result = classifier.process_image(image_base64)
        return ClassificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify-upload", response_model=ClassificationResponse)
async def classify_image_from_upload(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image_base64 = process_image_to_base64(image_bytes)
        result = classifier.process_image(image_base64)
        return ClassificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ==============================================================================
# SECTION 2: RUNNER (for local development)
# ==============================================================================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)