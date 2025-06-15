
import { useState } from 'react';
import { apiService } from '../services/api';
import { useToast } from './use-toast';
import { Document } from './useDocuments';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export const useChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuestionSubmit = async (question: string, selectedDocument: Document | null) => {
    if (!selectedDocument || selectedDocument.status !== 'ready') return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiService.askQuestion({
        document_id: parseInt(selectedDocument.id),
        question: question
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.answer,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Question failed:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I encountered an error while processing your question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Question Failed",
        description: error instanceof Error ? error.message : "Failed to process question",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatMessages = () => {
    setChatMessages([]);
  };

  return {
    chatMessages,
    isLoading,
    handleQuestionSubmit,
    clearChatMessages
  };
};
