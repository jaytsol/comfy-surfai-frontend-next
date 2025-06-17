"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, Users, UserPlus, Clock, MessageSquare, Image as ImageIcon, Video } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
}

interface TeamActivity {
  id: string;
  user: string;
  action: string;
  type: 'image' | 'video' | 'comment' | 'login';
  target?: string;
  time: string;
}

// Mock data - replace with actual API calls
const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'AI Engineer',
    email: 'alex.johnson@example.com',
    avatar: '/avatars/01.png',
    status: 'online',
    lastActive: '2025-06-09T10:30:00',
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Design Lead',
    email: 'maria.garcia@example.com',
    avatar: '/avatars/02.png',
    status: 'away',
    lastActive: '2025-06-09T09:45:00',
  },
  {
    id: '3',
    name: 'James Wilson',
    role: 'Frontend Developer',
    email: 'james.wilson@example.com',
    avatar: '/avatars/03.png',
    status: 'offline',
    lastActive: '2025-06-08T16:20:00',
  },
  {
    id: '4',
    name: 'Sarah Kim',
    role: 'Product Manager',
    email: 'sarah.kim@example.com',
    avatar: '/avatars/04.png',
    status: 'online',
    lastActive: '2025-06-09T11:15:00',
  },
];

const recentActivities: TeamActivity[] = [
  {
    id: 'a1',
    user: 'Alex Johnson',
    action: 'created a new image',
    type: 'image',
    target: 'Sunset Landscape',
    time: '10 minutes ago',
  },
  {
    id: 'a2',
    user: 'Maria Garcia',
    action: 'commented on',
    type: 'comment',
    target: 'Project Brief',
    time: '25 minutes ago',
  },
  {
    id: 'a3',
    user: 'James Wilson',
    action: 'uploaded a new video',
    type: 'video',
    target: 'Product Demo',
    time: '2 hours ago',
  },
  {
    id: 'a4',
    user: 'Sarah Kim',
    action: 'logged in',
    type: 'login',
    time: '3 hours ago',
  },
];

function getStatusColor(status: TeamMember['status']) {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-400';
  }
}

function getActivityIcon(type: TeamActivity['type']) {
  switch (type) {
    case 'image':
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    case 'video':
      return <Video className="h-4 w-4 text-purple-500" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'login':
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Team Members
        </h1>
        <p className="text-muted-foreground">
          Manage your team members and their permissions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Team Members List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Members</h2>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>

          <div className="space-y-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background ${getStatusColor(
                          member.status
                        )}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{member.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.role}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {member.status === 'online' 
                          ? 'Active now' 
                          : `Last active ${new Date(member.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Email</span>
                      </Button>
                      <Button variant="outline" size="icon">
                        <Phone className="h-4 w-4" />
                        <span className="sr-only">Call</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="space-y-6 p-6">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="mt-2 h-full w-px bg-border" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        {activity.target && (
                          <span className="font-medium">{activity.target}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-4 text-center">
                <Button variant="ghost" className="text-primary">
                  View all activity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Team Stats</CardTitle>
              <CardDescription>Overview of team activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                  <p className="text-2xl font-bold">
                    {teamMembers.filter(m => m.status === 'online').length}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">AI Engineers</span>
                  <span>1</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Designers</span>
                  <span>1</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Developers</span>
                  <span>1</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
  