import React, { useState } from 'react';
import { DocumentUpload } from '../components/DocumentUpload';
import { DocumentLibrary } from '../components/DocumentLibrary';
import { ChatInterface } from '../components/ChatInterface';
import { Header } from '../components/Header';

export interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  status: 'processing' | 'ready' | 'error';
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'sample-document.pdf',
      uploadDate: '2024-06-13',
      size: '2.4 MB',
      status: 'ready'
    }
  ]);
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(documents[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentUpload = (file: File) => {
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'processing'
    };
    
    setDocuments(prev => [...prev, newDocument]);
    
    // Simulate processing
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id ? { ...doc, status: 'ready' } : doc
      ));
    }, 3000);
  };

  const handleQuestionSubmit = async (question: string) => {
    if (!selectedDocument || selectedDocument.status !== 'ready') return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Based on the content of "${selectedDocument.name}", here's what I found: This is a mock response demonstrating how the AI would analyze your document and provide relevant answers to your questions.`,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          {/* Document Management Panel */}
          <div className="lg:col-span-4 space-y-6">
            <DocumentUpload onUpload={handleDocumentUpload} />
            <DocumentLibrary 
              documents={documents}
              selectedDocument={selectedDocument}
              onSelectDocument={setSelectedDocument}
            />
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-8">
            <ChatInterface
              selectedDocument={selectedDocument}
              messages={chatMessages}
              isLoading={isLoading}
              onQuestionSubmit={handleQuestionSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
