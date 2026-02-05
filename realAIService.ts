// Real AI Service - Calls actual backend API
const API_BASE = 'http://localhost:3001/api/v1/ai';

export const realAIService = {
  // Chat with AI
  async chat(message: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || data.message || 'AI response received';
    } catch (error) {
      console.error('AI Chat Error:', error);
      return 'Xin lỗi, có lỗi kết nối với AI. Vui lòng thử lại sau.';
    }
  },

  // Generate lesson
  async generateLesson(params: {
    topic: string;
    subject?: string;
    level?: string;
    duration?: number;
    objectives?: string[];
  }) {
    try {
      const response = await fetch(`${API_BASE}/content/lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Generate Lesson Error:', error);
      return { success: false, error: 'Failed to generate lesson' };
    }
  },

  // Generate exercise
  async generateExercise(params: {
    topic: string;
    subject?: string;
    level?: string;
    count?: number;
  }) {
    try {
      const response = await fetch(`${API_BASE}/content/exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Generate Exercise Error:', error);
      return { success: false, error: 'Failed to generate exercise' };
    }
  },

  // Generate quiz
  async generateQuiz(params: {
    topic: string;
    type?: string;
    count?: number;
    time_limit?: number;
  }) {
    try {
      const response = await fetch(`${API_BASE}/content/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Generate Quiz Error:', error);
      return { success: false, error: 'Failed to generate quiz' };
    }
  },

  // Library search
  async searchLibrary(params: {
    query: string;
    subject?: string;
    language?: string;
    format?: string;
  }) {
    try {
      const response = await fetch(`${API_BASE}/library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'search_digital_library',
          data: params
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Library Search Error:', error);
      return { success: false, error: 'Failed to search library' };
    }
  },

  // Get AI status
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE}/status`);
      return await response.json();
    } catch (error) {
      console.error('Get AI Status Error:', error);
      return { success: false, error: 'Failed to get AI status' };
    }
  }
};
