
import React, { useState, useEffect } from 'react';
import { DocumentUpload } from '../components/DocumentUpload';
import { DocumentLibrary } from '../components/DocumentLibrary';
import { ChatInterface } from '../components/ChatInterface';
import { Header } from '../components/Header';
import { apiService, ApiDocument } from '../services/api';
import { useToast } from '../hooks/use-toast';

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const apiDocs = await apiService.getDocuments();
      const formattedDocs: Document[] = apiDocs.map((doc: ApiDocument) => ({
        id: doc.id.toString(),
        name: doc.filename,
        uploadDate: new Date(doc.upload_date).toISOString().split('T')[0],
        size: 'N/A', // Size not provided by API
        status: 'ready' as const
      }));
      setDocuments(formattedDocs);
      
      // Set first document as selected if none selected
      if (!selectedDocument && formattedDocs.length > 0) {
        setSelectedDocument(formattedDocs[0]);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const handleDocumentUpload = async (file: File) => {
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'processing'
    };
    
    setDocuments(prev => [...prev, newDocument]);

    try {
      const uploadResponse = await apiService.uploadDocument(file);
      
      // Update document with real ID and mark as ready
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id 
          ? { ...doc, id: uploadResponse.id.toString(), status: 'ready' }
          : doc
      ));

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reload documents to ensure consistency
      await loadDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Mark document as error
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id ? { ...doc, status: 'error' } : doc
      ));

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    }
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

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    // Clear chat messages when switching documents
    setChatMessages([]);
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
              onSelectDocument={handleDocumentSelect}
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
