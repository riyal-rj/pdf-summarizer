
import { useState, useEffect } from 'react';
import { apiService, ApiDocument } from '../services/api';
import { useToast } from './use-toast';

export interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  status: 'processing' | 'ready' | 'error';
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  const loadDocuments = async (backendConnected: boolean) => {
    if (!backendConnected) return;
    
    try {
      console.log('Loading documents...');
      const apiDocs = await apiService.getDocuments();
      console.log('Documents loaded:', apiDocs);
      
      const formattedDocs: Document[] = apiDocs.map((doc: ApiDocument) => ({
        id: doc.id.toString(),
        name: doc.filename,
        uploadDate: new Date(doc.upload_date).toISOString().split('T')[0],
        size: 'N/A',
        status: 'ready' as const
      }));
      setDocuments(formattedDocs);
      
      if (!selectedDocument && formattedDocs.length > 0) {
        setSelectedDocument(formattedDocs[0]);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load documents",
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
      
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id 
          ? { ...doc, id: uploadResponse.id.toString(), status: 'ready' }
          : doc
      ));

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      return uploadResponse;
    } catch (error) {
      console.error('Upload failed:', error);
      
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id ? { ...doc, status: 'error' } : doc
      ));

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  return {
    documents,
    selectedDocument,
    loadDocuments,
    handleDocumentUpload,
    handleDocumentSelect
  };
};
