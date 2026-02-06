// Direct AI Service - Calls AI System directly (bypass backend)
const AI_BASE = 'http://localhost:8000';

export const directAIService = {
  // Chat directly with AI System
  async chat(message: string): Promise<string> {
    try {
      // First try AI System chat
      const aiResponse = await fetch(`${AI_BASE}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'chat',
          data: {
            message: message,
            context: 'education_management'
          }
        })
      });
      
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const aiText = aiData.response || aiData.message || '';
        
        // Check if it's mock data (template responses)
        if (aiText.includes('Tạo đề thi chuẩn hóa và chất lượng:') && 
            aiText.includes('Các dạng đề thi:') &&
            !aiText.includes('Câu 1')) {
          console.log('Detected mock data, falling back to direct Ollama...');
          
          // Fallback to direct Ollama
          const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama3:8b',
              prompt: message,
              stream: false
            })
          });
          
          if (ollamaResponse.ok) {
            const ollamaData = await ollamaResponse.json();
            return ollamaData.response || aiText;
          }
        }
        
        return aiText;
      } else {
        throw new Error(`AI System error: ${aiResponse.status}`);
      }
      
    } catch (error) {
      console.error('Direct AI Chat Error:', error);
      
      // Final fallback to direct Ollama
      try {
        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3:8b',
            prompt: message,
            stream: false
          })
        });
        
        if (ollamaResponse.ok) {
          const ollamaData = await ollamaResponse.json();
          return ollamaData.response || 'Xin lỗi, có lỗi kết nối với AI. Vui lòng thử lại sau.';
        }
      } catch (ollamaError) {
        console.error('Ollama fallback failed:', ollamaError);
      }
      
      return 'Xin lỗi, có lỗi kết nối với AI. Vui lòng thử lại sau.';
    }
  },

  // Generate content directly
  async generateContent(params: {
    task: string;
    data: any;
  }) {
    try {
      const response = await fetch(`${AI_BASE}/api/v1/content/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Direct AI Content Error:', error);
      return { success: false, error: 'Failed to generate content' };
    }
  },

  // Analyze data directly
  async analyze(params: {
    task: string;
    data: any;
  }) {
    try {
      const response = await fetch(`${AI_BASE}/api/v1/education/data-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Direct AI Analysis Error:', error);
      return { success: false, error: 'Failed to analyze data' };
    }
  },

  // Get AI system status
  async getStatus() {
    try {
      const response = await fetch(`${AI_BASE}/health`);
      return await response.json();
    } catch (error) {
      console.error('Get AI Status Error:', error);
      return { success: false, error: 'Failed to get AI status' };
    }
  }
};
