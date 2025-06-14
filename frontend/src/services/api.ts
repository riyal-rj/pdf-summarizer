
const API_BASE_URL = 'http://localhost:8000/api';

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
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }

  async getDocuments(): Promise<ApiDocument[]> {
    const response = await fetch(`${API_BASE_URL}/documents/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return response.json();
  }

  async askQuestion(request: QuestionRequest): Promise<AnswerResponse> {
    const response = await fetch(`${API_BASE_URL}/ask/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Question failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
