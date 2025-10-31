from langchain_ollama import OllamaLLM
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from config import settings
from typing import Optional
from services.vector_store_service import vector_store_service


class LLMService:
    def __init__(self):
        self.llm = OllamaLLM(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
            temperature=0.7
        )
        
        # Reference to vector store
        self.vector_store = vector_store_service
        
        self.system_prompt = """You are a helpful and knowledgeable Farmer Query Assistant. 
Your goal is to provide concise, practical advice for farmers. 
You are an expert in sustainable farming; proactively offer advice on how to reduce waste, 
save money by suggesting efficient alternatives, and improve soil health.
Always be friendly, clear, and supportive in your responses."""
        
        self.prompt_template = PromptTemplate(
            input_variables=["system_prompt", "context", "question"],
            template="""System: {system_prompt}

Context: {context}

Question: {question}

Answer: """
        )
    
    async def generate_response(
        self, 
        question: str, 
        context: Optional[str] = None,
        user_email: Optional[str] = None,
        use_rag: bool = True
    ) -> str:
        """
        Generate a response using the local LLM with RAG support
        
        Args:
            question: User's question
            context: Additional context (optional)
            user_email: User's email for personalized RAG
            use_rag: Whether to use RAG for context retrieval
        """
        try:
            # Get relevant context from vector store (RAG)
            rag_context = ""
            if use_rag and user_email:
                rag_context = self.vector_store.get_relevant_context(
                    query=question,
                    user_email=user_email,
                    max_results=3
                )
            
            # Combine contexts
            context_str = context if context else "No additional context provided."
            if rag_context:
                context_str = f"{context_str}\n\n{rag_context}"
            
            # Create the chain
            chain = LLMChain(llm=self.llm, prompt=self.prompt_template)
            
            # Generate response
            response = await chain.arun(
                system_prompt=self.system_prompt,
                context=context_str,
                question=question
            )            
            
            return response.strip()
        except Exception as e:
            raise Exception(f"Error generating response: {str(e)}")
    
    async def generate_response_with_history(
        self,
        question: str,
        user_email: str,
        context: Optional[str] = None
    ) -> dict:
        """
        Generate response and store in vector database
        
        Args:
            question: User's question
            user_email: User's email
            context: Additional context
            
        Returns:
            Dict with response and metadata
        """
        try:
            # Generate response with RAG
            response = await self.generate_response(
                question=question,
                context=context,
                user_email=user_email,
                use_rag=True
            )
            
            # Store in vector database
            vector_id = self.vector_store.add_conversation(
                user_email=user_email,
                question=question,
                response=response
            )
            
            return {
                "response": response,
                "vector_id": vector_id,
                "used_rag": True
            }
        except Exception as e:
            raise Exception(f"Error generating response with history: {str(e)}")
    
    async def generate_image_description(self, prompt: str) -> str:
        """Generate image description (since we can't generate images locally easily)"""
        question = f"Describe in detail what an image would look like based on this description: {prompt}"
        return await self.generate_response(question, use_rag=False)


# Create a singleton instance
llm_service = LLMService()
