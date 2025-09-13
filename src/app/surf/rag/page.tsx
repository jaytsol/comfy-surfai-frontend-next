'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Send, Loader2, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getRagDocuments, uploadRagDocument, postRagChatMessage, RagDocument, RagMessage } from '@/lib/apiClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RagPage() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<RagDocument | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<RagMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const fetchedDocuments = await getRagDocuments();
      setDocuments(fetchedDocuments);

      const isProcessing = fetchedDocuments.some(doc => doc.status === 'PROCESSING');
      if (!isProcessing && pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents.');
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    // Set up polling if there are processing documents
    pollingIntervalRef.current = setInterval(() => {
        setDocuments(prevDocs => {
            if (prevDocs.some(d => d.status === 'PROCESSING')) {
                fetchDocuments();
            }
            return prevDocs;
        })
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchDocuments]);

  useEffect(() => {
    // When a new document is selected, clear messages
    setMessages([]);
  }, [selectedDocument]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const newDoc = await uploadRagDocument(file);
      setDocuments(prev => [newDoc, ...prev]);
      fetchDocuments(); // Refresh list immediately
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedDocument) return;

    const newUserMessage: RagMessage = { sender: 'user', text: inputMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsSending(true);
    setError(null);

    try {
      const response = await postRagChatMessage(selectedDocument.id, inputMessage);
      const aiResponse: RagMessage = { sender: 'ai', text: response.response };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response.';
      setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${errorMessage}` }]);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: RagDocument['status']) => {
    switch (status) {
      case 'READY':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PROCESSING':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'ERROR':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-4rem)]">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="flex items-center gap-2">
                <Input id="file-upload" type="file" onChange={handleFileChange} accept=".pdf" className="flex-1" />
            </div>
            {file && <p className="text-sm text-gray-500 truncate">Selected: {file.name}</p>}
            <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                'Upload'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6 pt-0">
              <div className="space-y-2">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDocument?.id === doc.id
                        ? 'bg-gray-100 dark:bg-gray-800 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}>
                    <div className="flex items-center justify-between">
                        <p className="font-medium truncate pr-2">{doc.originalFilename}</p>
                        {getStatusIcon(doc.status)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2 flex flex-col h-full">
        <CardHeader>
          <CardTitle>
            {selectedDocument ? `Chat with: ${selectedDocument.originalFilename}` : 'Select a document to start chatting'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 border rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">A</div>}
                  <div className={`rounded-lg p-3 max-w-[70%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {msg.sender === 'user' && <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">U</div>}
                </div>
              ))}
              {isSending && (
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">A</div>
                    <div className="rounded-lg p-3 max-w-[70%] bg-gray-200 dark:bg-gray-700">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder={selectedDocument?.status === 'READY' ? 'Type your message...' : 'Select a processed document'}
              disabled={!selectedDocument || selectedDocument.status !== 'READY' || isSending}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!selectedDocument || selectedDocument.status !== 'READY' || isSending}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
