from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import requests
import base64
from io import BytesIO
from PIL import Image
from graph import ImageClassificationGraph
import config

# Initialize FastAPI app
app = FastAPI(
    title="Environmental Image Classification API",
    description="API for classifying images into garbage, potholes, deforestation, or reject categories",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your React app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ImageRequest(BaseModel):
    image_url: HttpUrl
    
# Response model
class ClassificationResponse(BaseModel):
    category: str
    severity: int | None
    severity_level: str | None
    scale: str | None

# Initialize the classification graph
classifier = ImageClassificationGraph()

def process_uploaded_file(file_content: bytes) -> str:
    """Process uploaded file and convert to base64"""
    try:
        # Create BytesIO object from file content
        image_bytes = BytesIO(file_content)
        
        # Open and verify it's a valid image
        try:
            image = Image.open(image_bytes)
            image.verify()  # Verify the image
            
            # Reopen the image since verify() closes it
            image_bytes.seek(0)
            image = Image.open(image_bytes)
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cannot open image file: {str(e)}")
        
        # Convert to RGB if necessary (for PNG with transparency)
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to base64
        buffer = BytesIO()
        image.save(buffer, format='JPEG', quality=95)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return image_base64
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unexpected error processing image: {str(e)}")

def download_and_encode_image(image_url: str) -> str:
    """Download image from URL and convert to base64"""
    try:
        # Set headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Download the image
        response = requests.get(image_url, timeout=30, headers=headers)
        response.raise_for_status()
        
        # Check if we have content
        if not response.content:
            raise HTTPException(status_code=400, detail="Downloaded content is empty")
        
        # Check content type
        content_type = response.headers.get('content-type', '').lower()
        if not any(img_type in content_type for img_type in ['image/', 'jpeg', 'jpg', 'png', 'gif', 'webp']):
            # Try to detect if it's still an image despite wrong content-type
            try:
                test_image = Image.open(BytesIO(response.content))
                test_image.verify()  # Verify it's a valid image
            except:
                raise HTTPException(status_code=400, detail=f"URL does not contain a valid image. Content-Type: {content_type}")
        
        # Create a fresh BytesIO object for PIL
        image_bytes = BytesIO(response.content)
        
        # Open and verify it's a valid image
        try:
            image = Image.open(image_bytes)
            image.verify()  # Verify the image
            
            # Reopen the image since verify() closes it
            image_bytes.seek(0)
            image = Image.open(image_bytes)
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cannot open image file: {str(e)}")
        
        # Convert to RGB if necessary (for PNG with transparency)
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to base64
        buffer = BytesIO()
        image.save(buffer, format='JPEG', quality=95)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return image_base64
        
    except HTTPException:
        # Re-raise HTTPExceptions as they are
        raise
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unexpected error processing image: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Environmental Image Classification API",
        "description": "Classify images using URL or direct upload",
        "endpoints": {
            "POST /classify": "Classify image from URL - send {\"image_url\": \"https://...\"}",
            "POST /classify-upload": "Classify uploaded image file - send multipart/form-data with 'file' field"
        },
        "categories": ["garbage", "potholes", "deforestation", "reject"],
        "severity_range": "0-100 (null for rejected images)",
        "fields": ["category", "severity", "severity_level", "scale"]
    }

@app.post("/classify", response_model=ClassificationResponse)
async def classify_image(request: ImageRequest):
    """
    Classify an image from a URL
    
    - **image_url**: Direct URL to an image file (jpg, png, etc.)
    
    Returns classification with category, severity (0-100), severity_level, and scale
    """
    # Check if API key is configured
    if not config.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
        )
    
    try:
        # Download and encode the image
        image_base64 = download_and_encode_image(str(request.image_url))
        
        # Process through the classification workflow
        result = classifier.process_image(image_base64)
        
        return ClassificationResponse(
            category=result["category"],
            severity=result["severity"],
            severity_level=result["severity_level"],
            scale=result["scale"]
        )
        
    except HTTPException:
        # Re-raise HTTPExceptions as they are
        raise
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/classify-upload", response_model=ClassificationResponse)
async def classify_uploaded_image(file: UploadFile = File(...)):
    """
    Classify an uploaded image file
    
    - **file**: Image file (jpg, png, gif, webp, etc.)
    
    Returns classification with category, severity (0-100), severity_level, and scale
    """
    # Check if API key is configured
    if not config.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
        )
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400, 
            detail="File must be an image (jpg, png, gif, webp, etc.)"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        if not file_content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Process the uploaded file
        image_base64 = process_uploaded_file(file_content)
        
        # Process through the classification workflow
        result = classifier.process_image(image_base64)
        
        return ClassificationResponse(
            category=result["category"],
            severity=result["severity"],
            severity_level=result["severity_level"],
            scale=result["scale"]
        )
        
    except HTTPException:
        # Re-raise HTTPExceptions as they are
        raise
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "api_key_configured": bool(config.OPENAI_API_KEY)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
