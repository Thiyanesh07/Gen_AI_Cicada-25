# Google Images Search with RAG Integration

## Overview

This feature adds a web search RAG (Retrieval-Augmented Generation) application for the visual crops part. When users prompt it, it searches Google Images and brings back relevant images with intelligent query refinement using RAG.

## Features

- **RAG-Enhanced Search**: Uses RAG to refine search queries based on crop context and past conversations
- **Context-Aware**: Automatically includes crop information (name, growth stage, location) to improve search results
- **Smart Query Refinement**: LLM analyzes user queries and crop context to generate optimized Google Images search queries
- **Farming-Focused Filtering**: Exclusively searches for farming/agriculture-related content:
  - Crops, soils, farming lands
  - Pesticides and fertilizers
  - Plant kingdom images
  - Diseases on leaves, fruits, vegetables
  - Agricultural practices and equipment
  - All farming-related content
- **Two Search Modes**:
  - General crop image search (automatically includes farming context)
  - Crop-specific image search (automatically includes crop context)

## Setup

### 1. Get Google Custom Search API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Custom Search API"
4. Create credentials (API Key)
5. Create a Custom Search Engine:
   - Go to [Google Custom Search](https://cse.google.com/)
   - Create a new search engine
   - Set it to search the entire web
   - Enable "Image Search"
   - Get your Search Engine ID (CX)

### 2. Configure Environment Variables

Add these to your `.env` file in the `backend` directory:

```env
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 3. Install Dependencies

All required dependencies are already in `requirements.txt`:
- `httpx==0.27.0` - For API requests

No additional packages needed!

## API Endpoints

### 1. General Image Search

```http
POST /api/crops/search-images
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "tomato flowering stage",
  "num_results": 12,
  "crop_context": {
    "crop_name": "Tomato",
    "growth_stage": "Flowering",
    "location": "Salem, Tamil Nadu"
  },
  "use_rag": true
}
```

**Response:**
```json
{
  "query": "tomato flowering stage",
  "refined_query": null,
  "results": [
    {
      "url": "https://example.com/image.jpg",
      "title": "Tomato Flowering Stage",
      "snippet": "Image showing tomato plants in flowering stage...",
      "thumbnail": "https://example.com/thumb.jpg",
      "width": 800,
      "height": 600,
      "source": "example.com"
    }
  ],
  "total_results": 12,
  "used_rag": true
}
```

### 2. Crop-Specific Image Search

Automatically includes crop information from the database:

```http
POST /api/crops/{crop_id}/search-images
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "disease symptoms",
  "num_results": 12,
  "use_rag": true
}
```

This endpoint automatically:
- Fetches crop information (name, growth stage, location)
- Includes it in the RAG context
- Refines the search query based on crop context

## How It Works

### RAG-Enhanced Query Refinement

1. **User Query**: User enters "tomato disease"
2. **Crop Context**: System retrieves crop information (if searching for specific crop)
3. **RAG Context**: System searches past conversations for relevant information
4. **Query Refinement**: LLM analyzes query + context and generates optimized search query
5. **Image Search**: Refined query is sent to Google Images API
6. **Results**: Relevant images are returned with metadata

### Example Flow

```
User Query: "pest control"
Crop Context: Tomato, Flowering stage, Salem, TN
Farming Enhancement: "pest control farming agriculture crop cultivation"
RAG Context: Past conversations about tomato pests
Refined Query: "tomato flowering pest control organic farming agriculture crop cultivation"
→ Google Images API
→ Filters results for farming-related content
→ Returns relevant agricultural images only
```

### Farming-Focused Filtering

The search engine is configured to ONLY return farming/agriculture-related images. All queries are automatically enhanced with farming keywords:

**Automatically Added Keywords:**
- farming, agriculture, crop, cultivation, farm
- soil, fertilizer, pesticide, irrigation, harvest
- plant, seed, seedling, vegetable, fruit, grain
- disease, pest, leaf, agricultural, farming land
- crop field, agricultural practices, plant health

**Focused Categories:**
- Crops and crop varieties
- Soils and soil types
- Farming lands and agricultural fields
- Pesticides and pest control
- Fertilizers and nutrients
- Plant kingdom (all plant-related content)
- Diseases on leaves, fruits, vegetables
- Agricultural equipment and tools
- Farming techniques and practices

## Frontend Integration

The CropPanel component includes:
- Image search input field
- Crop selection dropdown
- Image results grid
- "Search Images" button on each crop card
- RAG-enhanced search indicator

### Usage in Frontend

```typescript
import { searchCropImages, searchImagesForCrop } from '../../services/apiService';

// General search
const response = await searchCropImages({
  query: 'tomato flowering',
  num_results: 12,
  use_rag: true
});

// Crop-specific search
const response = await searchImagesForCrop(cropId, {
  query: 'disease symptoms',
  num_results: 12,
  use_rag: true
});
```

## Fallback Mode

If Google API credentials are not configured:
- System will show a warning message
- Search will return empty results with helpful instructions
- Users can still use the UI, but need to configure API keys for actual results

## Configuration

### Optional: Customize Image Search Parameters

In `backend/services/image_search_service.py`, you can customize:

```python
params = {
    "searchType": "image",
    "num": 10,  # Max 10 per request
    "safe": "active",  # Safe search
    "imgSize": "medium",  # medium, large, xlarge
    "imgType": "photo"  # photo, clipart, lineart, face
}
```

## Troubleshooting

### No Images Returned

1. Check if `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set correctly
2. Verify API key has Custom Search API enabled
3. Check Search Engine ID is correct
4. Verify search engine has "Image Search" enabled
5. Check API quota limits in Google Cloud Console

### RAG Not Working

1. Ensure Ollama is running (`http://localhost:11434`)
2. Check if vector store is initialized
3. Verify user email is passed correctly
4. Check backend logs for errors

## API Limits

- Google Custom Search API: 100 free queries per day
- Images per request: Maximum 10 (Google API limit)
- Multiple requests can be made to get more results

## Security Notes

- API keys should be kept in `.env` file (never commit to git)
- Use environment variables in production
- Consider rate limiting for API endpoints
- Implement caching for frequently searched queries

