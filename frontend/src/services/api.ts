
const API_BASE_URL = '/api';

export interface ApiDocument {
  id: number;
  filename: string;
  upload_date: string;
}

export interface UploadResponse {
  id: number;
  filename: string;
}

export interface QuestionRequest {
  document_id: number;
  question: string;
}

export interface AnswerResponse {
  answer: string;
}

class ApiService {
  private async makeRequest(url: string, options?: RequestInit) {
    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
        },
      });
      
      console.log(`Response status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`Network error for ${url}:`, error);
      throw new Error(`Cannot connect to backend server. Please ensure the FastAPI backend is running on http://localhost:8000`);
    }
  }

  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.makeRequest(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }

  async getDocuments(): Promise<ApiDocument[]> {
    const response = await this.makeRequest(`${API_BASE_URL}/documents/`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch documents' }));
      throw new Error(error.detail || 'Failed to fetch documents');
    }

    return response.json();
  }

  async askQuestion(request: QuestionRequest): Promise<AnswerResponse> {
    const response = await this.makeRequest(`${API_BASE_URL}/ask/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Question failed' }));
      throw new Error(error.detail || 'Question failed');
    }

    return response.json();
  }

  // Health check method to test backend connectivity
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${API_BASE_URL}/documents/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
