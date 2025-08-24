# Environmental Image Classification API Documentation

## 🚀 Overview

The Environmental Image Classification API is a FastAPI-based service that analyzes and classifies images into environmental categories: **garbage**, **potholes**, **deforestation**, or **reject**. It provides severity scoring (0-100) and scale information for identified environmental issues.

## 📋 API Information

- **Base URL**: `http://localhost:8000` (when running locally)
- **API Version**: 1.0.0
- **Content-Type**: `application/json` (for URL-based requests)
- **Framework**: FastAPI with automatic OpenAPI documentation

## 🔧 Setup & Installation

### Prerequisites
- Python 3.8+
- OpenAI API Key

### Installation Steps

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   Create a `.env` file in the project root:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the API server**:
   ```bash
   python fastapi_app.py
   ```
   Or using uvicorn:
   ```bash
   uvicorn fastapi_app:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Access API documentation**:
   - Interactive docs: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## 📊 API Endpoints

### 1. Root Endpoint
**GET** `/`

Returns basic API information and available endpoints.

```bash
curl -X GET "http://localhost:8000/"
```

**Response**:
```json
{
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
```

### 2. Classify Image from URL
**POST** `/classify`

Classifies an image from a provided URL.

**Request Body**:
```json
{
  "image_url": "https://example.com/image.jpg"
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:8000/classify" \
     -H "Content-Type: application/json" \
     -d '{
       "image_url": "https://example.com/pothole.jpg"
     }'
```

**Response**:
```json
{
  "category": "potholes",
  "severity": 75,
  "severity_level": "moderate-high",
  "scale": "medium-sized pothole affecting single lane"
}
```

### 3. Classify Uploaded Image
**POST** `/classify-upload`

Classifies an uploaded image file.

**Request**: Multipart form data with `file` field

**cURL Example**:
```bash
curl -X POST "http://localhost:8000/classify-upload" \
     -F "file=@/path/to/your/image.jpg"
```

**Response**:
```json
{
  "category": "garbage",
  "severity": 60,
  "severity_level": "moderate",
  "scale": "small pile of litter in park area"
}
```

### 4. Health Check
**GET** `/health`

Checks if the API is running and if the OpenAI API key is configured.

```bash
curl -X GET "http://localhost:8000/health"
```

**Response**:
```json
{
  "status": "healthy",
  "api_key_configured": true
}
```

## 📝 Response Schema

All classification endpoints return the following structure:

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Classification result: `"garbage"`, `"potholes"`, `"deforestation"`, or `"reject"` |
| `severity` | integer\|null | Severity score 0-100, `null` for rejected images |
| `severity_level` | string\|null | Human-readable severity: `"low"`, `"low-high"`, `"moderate"`, `"moderate-high"`, `"high"`, `"extreme"` |
| `scale` | string\|null | Description of issue size/extent, `null` for rejected images |

## ⚛️ React Frontend Integration

### Setup CORS
The API already includes CORS middleware configured to accept requests from any origin (`"*"`). For production, update the `allow_origins` in `fastapi_app.py` to your specific domain.

### 1. URL-Based Classification (React)

```jsx
import React, { useState } from 'react';

const ImageClassifyURL = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const classifyImage = async () => {
    if (!imageUrl) {
      setError('Please enter an image URL');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Classification failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="classify-url">
      <h2>Classify Image from URL</h2>
      
      <div>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL (https://...)"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        
        <button 
          onClick={classifyImage} 
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Analyzing...' : 'Classify Image'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <h3>Classification Result:</h3>
          <p><strong>Category:</strong> {result.category}</p>
          {result.severity !== null && (
            <>
              <p><strong>Severity:</strong> {result.severity}/100</p>
              <p><strong>Severity Level:</strong> {result.severity_level}</p>
              <p><strong>Scale:</strong> {result.scale}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageClassifyURL;
```

### 2. File Upload Classification (React)

```jsx
import React, { useState } from 'react';

const ImageClassifyUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/classify-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Classification failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setPreview(null);
  };

  return (
    <div className="classify-upload">
      <h2>Classify Uploaded Image</h2>
      
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ marginBottom: '10px' }}
        />
        
        <div>
          <button 
            onClick={classifyImage} 
            disabled={loading || !selectedFile}
            style={{ padding: '10px 20px', marginRight: '10px' }}
          >
            {loading ? 'Analyzing...' : 'Classify Image'}
          </button>
          
          <button 
            onClick={resetForm}
            style={{ padding: '10px 20px' }}
          >
            Reset
          </button>
        </div>
      </div>

      {preview && (
        <div style={{ margin: '15px 0' }}>
          <h4>Preview:</h4>
          <img 
            src={preview} 
            alt="Preview" 
            style={{ maxWidth: '300px', maxHeight: '200px', border: '1px solid #ccc' }}
          />
        </div>
      )}

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <h3>Classification Result:</h3>
          <p><strong>Category:</strong> {result.category}</p>
          {result.severity !== null && (
            <>
              <p><strong>Severity:</strong> {result.severity}/100</p>
              <p><strong>Severity Level:</strong> {result.severity_level}</p>
              <p><strong>Scale:</strong> {result.scale}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageClassifyUpload;
```

### 3. Combined Component (React)

```jsx
import React, { useState } from 'react';

const ImageClassifier = () => {
  const [activeTab, setActiveTab] = useState('url');

  return (
    <div className="image-classifier">
      <h1>Environmental Image Classifier</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('url')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'url' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'url' ? 'white' : 'black',
            border: '1px solid #ccc'
          }}
        >
          From URL
        </button>
        
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'upload' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'upload' ? 'white' : 'black',
            border: '1px solid #ccc'
          }}
        >
          Upload File
        </button>
      </div>

      {activeTab === 'url' && <ImageClassifyURL />}
      {activeTab === 'upload' && <ImageClassifyUpload />}
    </div>
  );
};

export default ImageClassifier;
```

## 🔒 Error Handling

The API returns standard HTTP status codes:

- **200**: Success
- **400**: Bad Request (invalid image, malformed request)
- **422**: Validation Error (invalid URL format)
- **500**: Internal Server Error (API key issues, processing errors)

### Error Response Format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Scenarios:

1. **Invalid URL**: 
   ```json
   {
     "detail": "URL does not contain a valid image. Content-Type: text/html"
   }
   ```

2. **Missing API Key**:
   ```json
   {
     "detail": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
   }
   ```

3. **Invalid File Type**:
   ```json
   {
     "detail": "File must be an image (jpg, png, gif, webp, etc.)"
   }
   ```
