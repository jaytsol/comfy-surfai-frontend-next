"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Settings, Mail, Shield, Calendar, FileText, Image as ImageIcon, Video, Activity, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
};

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-5 w-5 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

type ProfileSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function ProfileSection({ title, description, children }: ProfileSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Separator />
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };



  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">{user.username}</h1>
        <p className="text-muted-foreground flex items-center gap-1">
          <Shield className="h-4 w-4" />
          {user.role}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Generations"
          value="1,234"
          icon={<Zap className="h-5 w-5" />}
          description="+12% from last month"
        />
        <StatCard
          title="Images Created"
          value="856"
          icon={<ImageIcon className="h-5 w-5" />}
          description="+8% from last month"
        />
        <StatCard
          title="Videos Created"
          value="124"
          icon={<Video className="h-5 w-5" />}
          description="+24% from last month"
        />
        <StatCard
          title="Active Days"
          value="28"
          icon={<Activity className="h-5 w-5" />}
          description="This month"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Account Information */}
        <div className="md:col-span-2 space-y-8">
          <ProfileSection
            title="Account Information"
            description="Manage your account details and settings"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection
            title="Recent Activity"
            description="Your recent actions and generations"
          >
            <div className="space-y-4">
              {[
                { id: 1, text: 'Generated a new image: Sunset Beach', time: '2 hours ago', icon: <ImageIcon className="h-4 w-4" /> },
                { id: 2, text: 'Updated profile settings', time: '1 day ago', icon: <Settings className="h-4 w-4" /> },
                { id: 3, text: 'Created a new video: Mountain Range', time: '2 days ago', icon: <Video className="h-4 w-4" /> },
              ].map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 rounded-full bg-muted">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ProfileSection>
        </div>

        {/* Quick Links */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Access important pages quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ImageIcon className="mr-2 h-4 w-4" />
                My Creations
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your current subscription and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-lg font-bold">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">Billed monthly</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Storage</span>
                    <span>150GB / 200GB</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4"></div>
                  </div>
                  <p className="text-xs text-muted-foreground">75% of your storage used</p>
                </div>
                <Button className="w-full">Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}