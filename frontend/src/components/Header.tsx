import React from 'react';
import { FileText } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PDF Assistant</h1>
            <p className="text-sm text-gray-600">Upload documents and ask questions</p>
          </div>
        </div>
      </div>
    </header>
  );
};
