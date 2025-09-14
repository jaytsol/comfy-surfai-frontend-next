'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userMessage = { sender: 'user' as const, text: prompt };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError('');

    try {
      const result = await apiClient<{ response: string }>('/langchain/chat', {
        method: 'POST',
        body: { prompt: userMessage.text },
      });
      const aiMessage = { sender: 'ai' as const, text: result.response };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (err) {
      const errorMessage = '메시지를 전송하는 중 오류가 발생했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      const errorMessageForUser = { sender: 'ai' as const, text: errorMessage };
      setMessages((prevMessages) => [...prevMessages, errorMessageForUser]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-4rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>AI 채팅</CardTitle>
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
              {isLoading && (
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
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !isLoading && handleSubmit()}
              placeholder="AI에게 무엇이든 물어보세요."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSubmit} disabled={isLoading}>
              전송
            </Button>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
