"""
Base Agent Class for EduManager AI System
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
import asyncio
import json
import httpx
from datetime import datetime

class BaseAgent(ABC):
    def __init__(self, name: str, model: str = "llama3:8b-instruct"):
        self.name = name
        self.model = model
        self.description = ""
        self.capabilities = []
        self.ollama_url = "http://localhost:11434"
    
    @abstractmethod
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process the AI task"""
        pass
    
    async def call_ollama(self, prompt: str, system_prompt: str = None) -> str:
        """Call Ollama API for local LLM inference"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False
                }
                
                if system_prompt:
                    payload["system"] = system_prompt
                
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "")
                else:
                    raise Exception(f"Ollama API error: {response.status_code}")
                    
        except Exception as e:
            print(f"Error calling Ollama: {str(e)}")
            return f"Error: Unable to process request - {str(e)}"
    
    def format_response(self, response: str, confidence: float = 0.8, suggestions: List[str] = None) -> Dict[str, Any]:
        """Format the AI response"""
        return {
            "response": response,
            "confidence": confidence,
            "suggestions": suggestions or [],
            "timestamp": datetime.now().isoformat(),
            "agent": self.name
        }
    
    def extract_json_from_response(self, response: str) -> Dict[str, Any]:
        """Extract JSON from AI response"""
        try:
            # Try to find JSON in the response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {"raw_response": response}
        except:
            return {"raw_response": response}
