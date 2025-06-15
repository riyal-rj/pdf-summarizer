
import React, { useEffect } from 'react';
import { DocumentUpload } from '../components/DocumentUpload';
import { DocumentLibrary } from '../components/DocumentLibrary';
import { ChatInterface } from '../components/ChatInterface';
import { Header } from '../components/Header';
import { BackendConnectionError } from '../components/BackendConnectionError';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useBackendConnection } from '../hooks/useBackendConnection';
import { useDocuments } from '../hooks/useDocuments';
import { useChat } from '../hooks/useChat';

const Index = () => {
  const { backendConnected, checkBackendConnection } = useBackendConnection();
  const { 
    documents, 
    selectedDocument, 
    loadDocuments, 
    handleDocumentUpload, 
    handleDocumentSelect 
  } = useDocuments();
  const { 
    chatMessages, 
    isLoading, 
    handleQuestionSubmit, 
    clearChatMessages 
  } = useChat();

  // Load documents after backend connection is established
  useEffect(() => {
    if (backendConnected) {
      loadDocuments(backendConnected);
    }
  }, [backendConnected]);

  const onDocumentUpload = async (file: File) => {
    try {
      await handleDocumentUpload(file);
      // Reload documents to ensure consistency
      await loadDocuments(backendConnected || false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const onDocumentSelect = (document: any) => {
    handleDocumentSelect(document);
    // Clear chat messages when switching documents
    clearChatMessages();
  };

  const onQuestionSubmit = (question: string) => {
    handleQuestionSubmit(question, selectedDocument);
  };

  // Show connection status if backend is not connected
  if (backendConnected === false) {
    return <BackendConnectionError onRetry={checkBackendConnection} />;
  }

  // Show loading while checking connection
  if (backendConnected === null) {
    return <LoadingSpinner message="Connecting to backend..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          {/* Document Management Panel */}
          <div className="lg:col-span-4 space-y-6">
            <DocumentUpload onUpload={onDocumentUpload} />
            <DocumentLibrary 
              documents={documents}
              selectedDocument={selectedDocument}
              onSelectDocument={onDocumentSelect}
            />
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-8">
            <ChatInterface
              selectedDocument={selectedDocument}
              messages={chatMessages}
              isLoading={isLoading}
              onQuestionSubmit={onQuestionSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
