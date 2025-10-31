"""
Image Search Service with Google Images API
Provides image search capabilities with RAG-enhanced query refinement
"""

import httpx
from config import settings
from typing import List, Dict, Optional
from services.llm_service import llm_service


class ImageSearchService:
    """
    Service for searching Google Images with RAG-enhanced query refinement
    Focused exclusively on farming, agriculture, and related content
    """
    
    # Farming-specific domains and keywords to enhance search queries
    FARMING_KEYWORDS = [
        "farming", "agriculture", "crop", "cultivation", "farm",
        "soil", "fertilizer", "pesticide", "irrigation", "harvest",
        "plant", "seed", "seedling", "vegetable", "fruit", "grain",
        "disease", "pest", "leaf", "agricultural", "farming land",
        "agricultural land", "organic farming", "crop field"
    ]
    
    # Farming-focused categories
    FARMING_CONTEXTS = [
        "crops", "soils", "farming lands", "pesticides", "fertilizers",
        "plant kingdom", "diseases on leaves", "diseases on fruits",
        "diseases on vegetables", "agricultural practices", "crop management",
        "plant health", "agricultural equipment", "farming techniques"
    ]
    
    def __init__(self):
        # Google Custom Search API configuration
        self.api_key = settings.GOOGLE_API_KEY if hasattr(settings, 'GOOGLE_API_KEY') and settings.GOOGLE_API_KEY else None
        self.search_engine_id = settings.GOOGLE_SEARCH_ENGINE_ID if hasattr(settings, 'GOOGLE_SEARCH_ENGINE_ID') and settings.GOOGLE_SEARCH_ENGINE_ID else None
        self.base_url = "https://www.googleapis.com/customsearch/v1"
        
        if not self.api_key or not self.search_engine_id:
            print("⚠️ Warning: GOOGLE_API_KEY or GOOGLE_SEARCH_ENGINE_ID not configured")
            print("   Image search will use fallback method")
            print("   To enable full image search, set these in your .env file:")
            print("   GOOGLE_API_KEY=your_api_key")
            print("   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id")
    
    def _enhance_query_with_farming_context(self, query: str) -> str:
        """
        Enhance search query with farming-specific keywords to ensure
        results are focused on agriculture, farming, and related content
        
        Args:
            query: Original search query
            
        Returns:
            Enhanced query with farming context
        """
        # Check if query already contains farming-related terms
        query_lower = query.lower()
        has_farming_context = any(
            keyword in query_lower for keyword in self.FARMING_KEYWORDS
        )
        
        # If not, add farming context
        if not has_farming_context:
            # Add primary farming keywords to focus the search
            enhanced_query = f"{query} farming agriculture crop cultivation"
        else:
            # Still enhance but more subtly
            enhanced_query = query
        
        return enhanced_query.strip()
    
    async def refine_query_with_rag(
        self,
        query: str,
        crop_context: Optional[Dict] = None,
        user_email: Optional[str] = None
    ) -> str:
        """
        Refine search query using RAG to incorporate crop context
        
        Args:
            query: Original user query
            crop_context: Optional crop information (crop_name, growth_stage, etc.)
            user_email: User email for RAG context
            
        Returns:
            Refined search query
        """
        try:
            # Build context prompt
            context_parts = []
            if crop_context:
                context_parts.append(f"Crop: {crop_context.get('crop_name', 'N/A')}")
                context_parts.append(f"Growth Stage: {crop_context.get('growth_stage', 'N/A')}")
                context_parts.append(f"Location: {crop_context.get('location', 'N/A')}")
            
            # Get relevant context from past conversations using RAG
            # Focus on farming and agriculture
            rag_context = ""
            if user_email:
                rag_context = await llm_service.generate_response(
                    question=f"What farming/agricultural images would be most helpful for: {query}? Focus on crops, soils, farming practices, pesticides, fertilizers, plant diseases, and agricultural content.",
                    user_email=user_email,
                    use_rag=True
                )
            
            # Combine all context
            full_context = "\n".join(context_parts) if context_parts else "No crop context"
            if rag_context:
                full_context += f"\n\nRelevant information: {rag_context[:200]}"
            
            # Ask LLM to refine the search query with strict farming focus
            refinement_prompt = f"""Based on this user query: "{query}"
And this crop context: {full_context}

Generate an optimized Google Images search query that will return ONLY farming and agriculture-related images.
The search must focus on: crops, soils, farming lands, pesticides, fertilizers, plant kingdom, diseases on leaves/fruits/vegetables, and all agricultural content.

IMPORTANT: Return ONLY farming/agriculture-related content. Exclude non-farming images.
The query should include terms like: farming, agriculture, crop, cultivation, agricultural.

Return ONLY the search query text, nothing else, no quotes."""
            
            refined_query = await llm_service.generate_response(
                question=refinement_prompt,
                context=full_context,
                use_rag=False
            )
            
            # Clean up the response (remove quotes, extra text)
            refined_query = refined_query.strip().strip('"').strip("'")
            if len(refined_query) > 100:
                refined_query = refined_query[:100]
            
            return refined_query if refined_query else query
            
        except Exception as e:
            print(f"Error refining query with RAG: {str(e)}")
            return query
    
    async def search_images(
        self,
        query: str,
        num_results: int = 10,
        crop_context: Optional[Dict] = None,
        user_email: Optional[str] = None,
        use_rag: bool = True
    ) -> List[Dict]:
        """
        Search Google Images for relevant images
        
        Args:
            query: Search query
            num_results: Number of images to return (max 10 per request)
            crop_context: Optional crop information for RAG enhancement
            user_email: User email for RAG context
            use_rag: Whether to use RAG for query refinement
            
        Returns:
            List of image results with url, title, snippet, etc.
        """
        try:
            # Always enhance query with farming context first
            farming_enhanced_query = self._enhance_query_with_farming_context(query)
            
            # Refine query with RAG if enabled
            if use_rag and crop_context:
                search_query = await self.refine_query_with_rag(
                    query=farming_enhanced_query,
                    crop_context=crop_context,
                    user_email=user_email
                )
                print(f"🔍 RAG-refined query: '{search_query}' (original: '{query}')")
            else:
                search_query = farming_enhanced_query
            
            # Final enhancement: Ensure farming context is present
            search_query = self._enhance_query_with_farming_context(search_query)
            
            # Use Google Custom Search API if configured
            if self.api_key and self.search_engine_id:
                return await self._search_with_google_api(search_query, num_results)
            else:
                # Fallback to alternative method
                return await self._search_with_alternative_method(search_query, num_results)
                
        except Exception as e:
            print(f"Error searching images: {str(e)}")
            return []
    
    async def _search_with_google_api(self, query: str, num_results: int) -> List[Dict]:
        """Search using Google Custom Search API"""
        try:
            async with httpx.AsyncClient() as client:
                # Enhance query to focus on farming content
                farming_query = self._enhance_query_with_farming_context(query)
                
                params = {
                    "key": self.api_key,
                    "cx": self.search_engine_id,
                    "q": farming_query,  # Use farming-enhanced query
                    "searchType": "image",
                    "num": min(num_results, 10),  # Google API limit
                    "safe": "active",  # Safe search
                    "imgSize": "medium",  # medium, large, xlarge
                    "imgType": "photo"  # photo, clipart, lineart, face
                }
                
                response = await client.get(self.base_url, params=params, timeout=15.0)
                response.raise_for_status()
                data = response.json()
                
                # Extract and filter image results (ensure farming-related)
                images = []
                for item in data.get("items", [])[:num_results]:
                    title = item.get("title", "").lower()
                    snippet = item.get("snippet", "").lower()
                    display_link = item.get("displayLink", "").lower()
                    
                    # Filter to ensure farming/agriculture relevance
                    text_content = f"{title} {snippet} {display_link}"
                    
                    # Check if result is farming-related
                    is_farming_related = any(
                        keyword in text_content for keyword in self.FARMING_KEYWORDS
                    )
                    
                    # Only include if farming-related (or if we have limited results)
                    if is_farming_related or len(images) < 3:  # Keep at least 3 results even if less relevant
                        images.append({
                            "url": item.get("link", ""),
                            "title": item.get("title", ""),
                            "snippet": item.get("snippet", ""),
                            "thumbnail": item.get("image", {}).get("thumbnailLink", ""),
                            "width": item.get("image", {}).get("width", 0),
                            "height": item.get("image", {}).get("height", 0),
                            "source": item.get("displayLink", "")
                        })
                
                print(f"✅ Found {len(images)} farming-related images for query: '{farming_query}'")
                return images
                
        except httpx.HTTPError as e:
            print(f"HTTP error in Google Images API: {str(e)}")
            return []
        except Exception as e:
            print(f"Error in Google Images API search: {str(e)}")
            return []
    
    async def _search_with_alternative_method(self, query: str, num_results: int) -> List[Dict]:
        """
        Fallback image search method using DuckDuckGo or web scraping
        This is a simpler approach that doesn't require API keys
        """
        try:
            # Try using DuckDuckGo Images API (no key required)
            import urllib.parse
            
            encoded_query = urllib.parse.quote_plus(query)
            # Using DuckDuckGo instant answer API as fallback
            # Note: This is a simplified implementation
            
            # For now, return a placeholder structure
            # In production, you could use libraries like `duckduckgo-search` or `serpapi`
            print("⚠️ Using fallback image search (Google API not configured)")
            print(f"   To enable full image search, set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID")
            print(f"   Query would be: '{query}'")
            
            # Return empty results with helpful message
            # Users should configure Google API for full functionality
            return []
            
        except Exception as e:
            print(f"Error in alternative image search: {str(e)}")
            return []
    
    async def search_images_for_crop(
        self,
        crop_name: str,
        growth_stage: Optional[str] = None,
        query_modifier: Optional[str] = None,
        num_results: int = 10,
        user_email: Optional[str] = None
    ) -> List[Dict]:
        """
        Convenience method to search images for a specific crop
        
        Args:
            crop_name: Name of the crop
            growth_stage: Optional growth stage (e.g., "seedling", "flowering")
            query_modifier: Optional additional query terms
            num_results: Number of images to return
            user_email: User email for RAG context
            
        Returns:
            List of image results
        """
        # Build query with explicit farming focus
        query_parts = [crop_name]
        if growth_stage:
            query_parts.append(growth_stage)
        if query_modifier:
            query_parts.append(query_modifier)
        # Always include farming context
        query_parts.extend(["agriculture", "farming", "crop", "cultivation"])
        
        search_query = " ".join(query_parts)
        
        crop_context = {
            "crop_name": crop_name,
            "growth_stage": growth_stage or "N/A"
        }
        
        return await self.search_images(
            query=search_query,
            num_results=num_results,
            crop_context=crop_context,
            user_email=user_email,
            use_rag=True
        )


# Create a singleton instance
image_search_service = ImageSearchService()

