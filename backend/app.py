import streamlit as st
import base64
from PIL import Image
import io
from graph import ImageClassificationGraph
import config
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import requests
import threading
import uvicorn

# ==============================================================================
# SECTION 1: FASTAPI BACKEND LOGIC
# ==============================================================================

# Initialize FastAPI app
fastapi_app = FastAPI(
    title="Environmental Image Classification API",
    description="API for classifying images into categories",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://setu-sandy.vercel.app",  # Add your deployed frontend URL here
]
fastapi_app.add_middleware(
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

# Initialize Classification Logic (used by both apps)
classifier = ImageClassificationGraph()

# Image Processing Helper Functions for FastAPI
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
@fastapi_app.post("/classify", response_model=ClassificationResponse)
async def classify_image_from_url(request: ImageRequest):
    try:
        image_bytes = download_image(str(request.image_url))
        image_base64 = process_image_to_base64(image_bytes)
        result = classifier.process_image(image_base64)
        return ClassificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@fastapi_app.post("/classify-upload", response_model=ClassificationResponse)
async def classify_image_from_upload(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image_base64 = process_image_to_base64(image_bytes)
        result = classifier.process_image(image_base64)
        return ClassificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@fastapi_app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ==============================================================================
# SECTION 2: STREAMLIT UI LOGIC
# ==============================================================================

def display_results_streamlit(result: dict):
    """Display classification results in Streamlit."""
    st.subheader("📋 Classification Result")
    st.json(result)
    category = result.get('category', 'reject')
    if category == 'reject':
        st.error("❌ **Status: REJECTED**")
    else:
        emojis = {'garbage': '🗑️', 'potholes': '🕳️', 'deforestation': '🌳'}
        st.success(f"{emojis.get(category, '❓')} **Classified as: {category.upper()}**")
        if result.get('severity') is not None:
            st.info(f"📊 **Severity:** {result['severity']}/100 ({result.get('severity_level', 'N/A')})")
            st.info(f"📏 **Scale:** {result.get('scale', 'N/A')}")

def streamlit_main():
    """Main Streamlit application logic."""
    st.set_page_config(page_title="Image Classification System", layout="wide")
    st.title("🔍 Environmental Image Classification System")
    st.markdown("This app is a local interface for testing the `ImageClassificationGraph`.")

    if not config.OPENAI_API_KEY:
        st.error("⚠️ OpenAI API key not configured.")
        st.stop()
    
    uploaded_file = st.file_uploader("Choose an image file", type=['png', 'jpg', 'jpeg'])
    
    if uploaded_file:
        col1, col2 = st.columns(2)
        with col1:
            st.image(uploaded_file, caption="Uploaded Image", use_container_width=True)
        with col2:
            if st.button("🔍 Analyze Image", type="primary"):
                with st.spinner("Analyzing..."):
                    try:
                        image = Image.open(uploaded_file).convert("RGB")
                        buffer = io.BytesIO()
                        image.save(buffer, format="JPEG")
                        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
                        result = classifier.process_image(img_base64)
                        display_results_streamlit(result)
                    except Exception as e:
                        st.error(f"An error occurred: {e}")

# ==============================================================================
# SECTION 3: RUNNER
# ==============================================================================

def run_fastapi():
    """Function to run the FastAPI server."""
    uvicorn.run(fastapi_app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    # Run FastAPI in a separate thread
    fastapi_thread = threading.Thread(target=run_fastapi, daemon=True)
    fastapi_thread.start()
    
    # Run the Streamlit app in the main thread
    streamlit_main()