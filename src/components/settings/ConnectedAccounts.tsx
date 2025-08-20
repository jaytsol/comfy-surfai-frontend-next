'use client';

import { useEffect, useState } from 'react';
import { getConnections, disconnectSocial } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/common/icons';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface SupportedPlatform {
  id: string;
  name: string;
  icon: keyof typeof Icons;
  connectUrl: string;
}

const supportedPlatforms: SupportedPlatform[] = [
  {
    id: 'YOUTUBE',
    name: 'YouTube',
    icon: 'youtube',
    connectUrl: `${process.env.NEXT_PUBLIC_API_URL}/connect/google`,
  },
  // TODO: Add other platforms like X, Instagram etc.
];

export function ConnectedAccounts() {
  const [connected, setConnected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const connections = await getConnections();
      setConnected(connections);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleDisconnect = async (platform: string) => {
    try {
      await disconnectSocial(platform);
      // Refetch connections to update the UI
      await fetchConnections();
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
      // TODO: Show error toast
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>연동된 계정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {supportedPlatforms.map((platform) => {
          const isConnected = connected.includes(platform.id);
          const Icon = Icons[platform.icon];

          return (
            <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Icon className="w-6 h-6" />
                <span className="font-semibold">{platform.name}</span>
              </div>
              {isConnected ? (
                <Button variant="destructive" onClick={() => handleDisconnect(platform.id)}>
                  연동 해제
                </Button>
              ) : (
                <Button asChild>
                  <a href={platform.connectUrl}>연동하기</a>
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
