
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from './Header';

interface BackendConnectionErrorProps {
  onRetry: () => void;
}

export const BackendConnectionError: React.FC<BackendConnectionErrorProps> = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend Connection Failed</h2>
            <p className="text-gray-600 mb-6">
              Cannot connect to the FastAPI backend server. Please ensure it's running on:
            </p>
            <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
              http://localhost:8000/docs
            </code>
            <div className="mt-6">
              <button
                onClick={onRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
            <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">To start the backend:</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Navigate to the backend directory</li>
                <li>Install dependencies: <code className="bg-white px-1 rounded">pip install -r requirements.txt</code></li>
                <li>Run the server: <code className="bg-white px-1 rounded">uvicorn main:app --reload</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
