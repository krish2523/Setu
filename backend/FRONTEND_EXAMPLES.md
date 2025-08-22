# Frontend Integration Examples

This document provides examples of how to integrate the Environmental Image Classification API with various frontend frameworks.

## Table of Contents
- [React Integration](#react-integration)
- [Vue.js Integration](#vuejs-integration)
- [Vanilla JavaScript](#vanilla-javascript)
- [Node.js Backend Integration](#nodejs-backend-integration)
- [Python Requests](#python-requests)

## React Integration

### Complete React Component with Hooks

```jsx
import React, { useState, useCallback } from 'react';

const ImageClassifier = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleClassifyUrl = useCallback(async () => {
    if (!imageUrl) {
      setError('Please enter an image URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageUrl }),
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
  }, [imageUrl, API_BASE_URL]);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/classify-upload`, {
        method: 'POST',
        body: formData,
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
  }, [selectedFile, API_BASE_URL]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Environmental Image Classifier</h1>
      
      {/* URL Input */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Classify from URL</h3>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button onClick={handleClassifyUrl} disabled={loading}>
          {loading ? 'Analyzing...' : 'Classify URL'}
        </button>
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Upload File</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{ marginBottom: '10px' }}
        />
        <button onClick={handleFileUpload} disabled={loading}>
          {loading ? 'Analyzing...' : 'Classify File'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Classification Result</h3>
          <p><strong>Category:</strong> {result.category}</p>
          {result.severity !== null && (
            <>
              <p><strong>Severity:</strong> {result.severity}/100</p>
              <p><strong>Level:</strong> {result.severity_level}</p>
              <p><strong>Scale:</strong> {result.scale}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;
```

### React Hook for API Calls

```jsx
// hooks/useImageClassifier.js
import { useState, useCallback } from 'react';

export const useImageClassifier = (apiBaseUrl = 'http://localhost:8000') => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const classifyUrl = useCallback(async (imageUrl) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Classification failed');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const classifyFile = useCallback(async (file) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiBaseUrl}/classify-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Classification failed');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    classifyUrl,
    classifyFile,
    reset,
  };
};
```

## Vue.js Integration

### Vue 3 Composition API

```vue
<template>
  <div class="image-classifier">
    <h1>Environmental Image Classifier</h1>
    
    <!-- URL Classification -->
    <div class="section">
      <h3>Classify from URL</h3>
      <input 
        v-model="imageUrl" 
        type="url" 
        placeholder="Enter image URL"
        class="input"
      />
      <button @click="classifyFromUrl" :disabled="loading" class="button">
        {{ loading ? 'Analyzing...' : 'Classify URL' }}
      </button>
    </div>

    <!-- File Upload -->
    <div class="section">
      <h3>Upload File</h3>
      <input 
        @change="handleFileSelect" 
        type="file" 
        accept="image/*"
        class="input"
      />
      <button @click="classifyFromFile" :disabled="loading" class="button">
        {{ loading ? 'Analyzing...' : 'Classify File' }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error">
      Error: {{ error }}
    </div>

    <!-- Results -->
    <div v-if="result" class="result">
      <h3>Classification Result</h3>
      <p><strong>Category:</strong> {{ result.category }}</p>
      <template v-if="result.severity !== null">
        <p><strong>Severity:</strong> {{ result.severity }}/100</p>
        <p><strong>Level:</strong> {{ result.severity_level }}</p>
        <p><strong>Scale:</strong> {{ result.scale }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const API_BASE_URL = 'http://localhost:8000'

const imageUrl = ref('')
const selectedFile = ref(null)
const result = ref(null)
const loading = ref(false)
const error = ref(null)

const classifyFromUrl = async () => {
  if (!imageUrl.value) {
    error.value = 'Please enter an image URL'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`${API_BASE_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: imageUrl.value }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Classification failed')
    }

    const data = await response.json()
    result.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
}

const classifyFromFile = async () => {
  if (!selectedFile.value) {
    error.value = 'Please select a file'
    return
  }

  loading.value = true
  error.value = null

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await fetch(`${API_BASE_URL}/classify-upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Classification failed')
    }

    const data = await response.json()
    result.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.image-classifier {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  margin-bottom: 20px;
}

.input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  padding: 10px;
  border: 1px solid red;
  border-radius: 4px;
  margin: 10px 0;
}

.result {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 20px;
}
</style>
```

## Vanilla JavaScript

### Pure JavaScript Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Image Classifier</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .section { margin: 20px 0; }
        input, button { padding: 10px; margin: 5px 0; }
        input[type="url"], input[type="file"] { width: 100%; }
        button { background: #007bff; color: white; border: none; cursor: pointer; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .error { color: red; border: 1px solid red; padding: 10px; }
        .result { border: 1px solid #ccc; padding: 20px; }
    </style>
</head>
<body>
    <h1>Environmental Image Classifier</h1>

    <div class="section">
        <h3>Classify from URL</h3>
        <input type="url" id="imageUrl" placeholder="Enter image URL">
        <button onclick="classifyFromUrl()">Classify URL</button>
    </div>

    <div class="section">
        <h3>Upload File</h3>
        <input type="file" id="imageFile" accept="image/*">
        <button onclick="classifyFromFile()">Classify File</button>
    </div>

    <div id="result"></div>

    <script>
        const API_BASE_URL = 'http://localhost:8000';

        async function classifyFromUrl() {
            const imageUrl = document.getElementById('imageUrl').value;
            if (!imageUrl) {
                showError('Please enter an image URL');
                return;
            }

            showLoading();

            try {
                const response = await fetch(`${API_BASE_URL}/classify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image_url: imageUrl }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Classification failed');
                }

                const data = await response.json();
                showResult(data);
            } catch (error) {
                showError(error.message);
            }
        }

        async function classifyFromFile() {
            const fileInput = document.getElementById('imageFile');
            const file = fileInput.files[0];
            
            if (!file) {
                showError('Please select a file');
                return;
            }

            showLoading();

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${API_BASE_URL}/classify-upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Classification failed');
                }

                const data = await response.json();
                showResult(data);
            } catch (error) {
                showError(error.message);
            }
        }

        function showLoading() {
            document.getElementById('result').innerHTML = '<div>Loading...</div>';
        }

        function showError(message) {
            document.getElementById('result').innerHTML = `<div class="error">Error: ${message}</div>`;
        }

        function showResult(data) {
            let html = '<div class="result"><h3>Classification Result</h3>';
            html += `<p><strong>Category:</strong> ${data.category}</p>`;
            
            if (data.severity !== null) {
                html += `<p><strong>Severity:</strong> ${data.severity}/100</p>`;
                html += `<p><strong>Level:</strong> ${data.severity_level}</p>`;
                html += `<p><strong>Scale:</strong> ${data.scale}</p>`;
            }
            
            html += '</div>';
            document.getElementById('result').innerHTML = html;
        }
    </script>
</body>
</html>
```

## Node.js Backend Integration

### Express.js Middleware

```javascript
// middleware/imageClassifier.js
const fetch = require('node-fetch');
const FormData = require('form-data');

class ImageClassifierClient {
  constructor(apiBaseUrl = 'http://localhost:8000') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async classifyFromUrl(imageUrl) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Classification failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Classification failed: ${error.message}`);
    }
  }

  async classifyFromBuffer(imageBuffer, filename = 'image.jpg') {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, filename);

      const response = await fetch(`${this.apiBaseUrl}/classify-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Classification failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Classification failed: ${error.message}`);
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      return await response.json();
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
}

module.exports = ImageClassifierClient;
```

### Express.js Route Examples

```javascript
// routes/classify.js
const express = require('express');
const multer = require('multer');
const ImageClassifierClient = require('../middleware/imageClassifier');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const classifier = new ImageClassifierClient();

// Classify from URL
router.post('/classify-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const result = await classifier.classifyFromUrl(imageUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Classify uploaded file
router.post('/classify-upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await classifier.classifyFromBuffer(req.file.buffer, req.file.originalname);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const health = await classifier.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Python Requests

### Python Client Library

```python
import requests
from typing import Dict, Any, Optional
import base64
from io import BytesIO
from PIL import Image

class ImageClassifierClient:
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url.rstrip('/')
    
    def classify_from_url(self, image_url: str) -> Dict[str, Any]:
        """Classify an image from URL"""
        try:
            response = requests.post(
                f"{self.api_base_url}/classify",
                json={"image_url": image_url},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Classification failed: {e}")
    
    def classify_from_file(self, file_path: str) -> Dict[str, Any]:
        """Classify an image from file path"""
        try:
            with open(file_path, 'rb') as file:
                files = {'file': file}
                response = requests.post(
                    f"{self.api_base_url}/classify-upload",
                    files=files
                )
                response.raise_for_status()
                return response.json()
        except (requests.exceptions.RequestException, IOError) as e:
            raise Exception(f"Classification failed: {e}")
    
    def classify_from_bytes(self, image_bytes: bytes, filename: str = "image.jpg") -> Dict[str, Any]:
        """Classify an image from bytes"""
        try:
            files = {'file': (filename, image_bytes)}
            response = requests.post(
                f"{self.api_base_url}/classify-upload",
                files=files
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Classification failed: {e}")
    
    def health_check(self) -> Dict[str, Any]:
        """Check API health"""
        try:
            response = requests.get(f"{self.api_base_url}/health")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Health check failed: {e}")

# Usage examples
if __name__ == "__main__":
    client = ImageClassifierClient()
    
    # Classify from URL
    try:
        result = client.classify_from_url("https://example.com/image.jpg")
        print("URL Classification:", result)
    except Exception as e:
        print("Error:", e)
    
    # Classify from file
    try:
        result = client.classify_from_file("path/to/image.jpg")
        print("File Classification:", result)
    except Exception as e:
        print("Error:", e)
    
    # Health check
    try:
        health = client.health_check()
        print("API Health:", health)
    except Exception as e:
        print("Error:", e)
```

### Async Python Client

```python
import aiohttp
import asyncio
from typing import Dict, Any

class AsyncImageClassifierClient:
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url.rstrip('/')
    
    async def classify_from_url(self, image_url: str) -> Dict[str, Any]:
        """Classify an image from URL asynchronously"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{self.api_base_url}/classify",
                    json={"image_url": image_url}
                ) as response:
                    response.raise_for_status()
                    return await response.json()
            except aiohttp.ClientError as e:
                raise Exception(f"Classification failed: {e}")
    
    async def classify_from_bytes(self, image_bytes: bytes, filename: str = "image.jpg") -> Dict[str, Any]:
        """Classify an image from bytes asynchronously"""
        async with aiohttp.ClientSession() as session:
            try:
                data = aiohttp.FormData()
                data.add_field('file', image_bytes, filename=filename)
                
                async with session.post(
                    f"{self.api_base_url}/classify-upload",
                    data=data
                ) as response:
                    response.raise_for_status()
                    return await response.json()
            except aiohttp.ClientError as e:
                raise Exception(f"Classification failed: {e}")

# Usage example
async def main():
    client = AsyncImageClassifierClient()
    
    try:
        result = await client.classify_from_url("https://example.com/image.jpg")
        print("Classification result:", result)
    except Exception as e:
        print("Error:", e)

# Run the async example
# asyncio.run(main())
```

## Common Error Handling Patterns

### JavaScript Error Handler
```javascript
function handleApiError(error, response) {
  if (response && response.status === 400) {
    return `Invalid input: ${error.detail || error.message}`;
  } else if (response && response.status === 500) {
    return `Server error: ${error.detail || error.message}`;
  } else if (response && response.status === 422) {
    return `Validation error: ${error.detail || error.message}`;
  } else {
    return `Network error: ${error.message}`;
  }
}
```

### Python Error Handler
```python
def handle_api_error(response):
    if response.status_code == 400:
        return f"Invalid input: {response.json().get('detail', 'Bad request')}"
    elif response.status_code == 500:
        return f"Server error: {response.json().get('detail', 'Internal server error')}"
    elif response.status_code == 422:
        return f"Validation error: {response.json().get('detail', 'Validation failed')}"
    else:
        return f"HTTP {response.status_code}: {response.text}"
```

These examples provide comprehensive integration patterns for various frontend and backend technologies. Choose the one that best fits your project's technology stack.
