from langchain_ollama import OllamaLLM
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from config import settings
from typing import Optional


class LLMService:
    def __init__(self):
        self.llm = OllamaLLM(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
            temperature=0.7
        )
        
        
        self.system_prompt = """You are a helpful and knowledgeable Farmer Query Assistant. 
Your goal is to provide concise, practical advice for farmers. 
You are an expert in sustainable farming; proactively offer advice on how to reduce waste, 
save money by suggesting efficient alternatives, and improve soil health.
Always be friendly, clear, and supportive in your responses."""
        
        self.prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="""System: {system_prompt}

Context: {context}

Question: {question}

Answer: """
        )
    
    async def generate_response(self, question: str, context: Optional[str] = None) -> str:
        """Generate a response using the local LLM"""
        try:
            # Prepare context
            context_str = context if context else "No additional context provided."
            
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
    
    async def generate_image_description(self, prompt: str) -> str:
        """Generate image description (since we can't generate images locally easily)"""
        question = f"Describe in detail what an image would look like based on this description: {prompt}"
        return await self.generate_response(question)


# Create a singleton instance
llm_service = LLMService()
