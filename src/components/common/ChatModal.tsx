'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ChatModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ChatModal({ isOpen, onOpenChange }: ChatModalProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!prompt) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await apiClient<{ response: string }>('/langchain/chat', {
        method: 'POST',
        body: { prompt },
      });
      setResponse(result.response);
    } catch (err) {
      setError('메시지를 전송하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI 채팅</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">AI에게 무엇이든 물어보세요.</p>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="prompt"
                placeholder='예: "AI 시의 미래에 대해 한 문장으로 써줘"'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
                disabled={isLoading}
              />
              <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '전송'}
              </Button>
            </div>
          </div>

          {(isLoading || response || error) && (
            <div className="w-full rounded-md border bg-gray-50 p-4 min-h-[100px] max-h-[400px] overflow-y-auto">
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-gray-500">AI가 답변을 생성하고 있습니다...</p>
                </div>
              )}
              {response && <p className="text-sm whitespace-pre-wrap">{response}</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
