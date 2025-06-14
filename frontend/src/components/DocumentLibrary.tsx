
import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Document } from '../pages/Index';

interface DocumentLibraryProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (document: Document) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  selectedDocument,
  onSelectDocument
}) => {
  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return 'Processing...';
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Upload failed';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Documents</h2>
      
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((document) => (
            <div
              key={document.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                document.status === 'ready' ? 'cursor-pointer' : 'cursor-not-allowed'
              } ${
                selectedDocument?.id === document.id
                  ? 'border-blue-500 bg-blue-50'
                  : document.status === 'error'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => document.status === 'ready' && onSelectDocument(document)}
            >
              <div className="flex items-start space-x-3">
                <FileText className={`h-5 w-5 mt-0.5 ${
                  document.status === 'error' ? 'text-red-600' : 'text-gray-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {document.name}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <p className="text-xs text-gray-500">{document.size}</p>
                    <p className="text-xs text-gray-500">{document.uploadDate}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusIcon(document.status)}
                    <span className={`text-xs ${
                      document.status === 'error' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {getStatusText(document.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
