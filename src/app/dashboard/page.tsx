import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Clock, Image as ImageIcon, LineChart, Plus, Settings, Sparkles, Video, Zap } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
};

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}

type RecentActivity = {
  id: string;
  type: 'image' | 'video' | 'settings' | 'system';
  title: string;
  time: string;
  icon: React.ReactNode;
};

function ActivityItem({ activity }: { activity: RecentActivity }) {
  return (
    <div className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
      <div className="rounded-full bg-muted p-2">
        {activity.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activity.time}
        </p>
      </div>
      <Button variant="ghost" size="sm" className="h-8">View</Button>
    </div>
  );
}

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Generations",
      value: "1,248",
      change: "+12% from last month",
      icon: <Sparkles className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Images Created",
      value: "856",
      change: "+8% from last month",
      icon: <ImageIcon className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Videos Created",
      value: "124",
      change: "+24% from last month",
      icon: <Video className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Active Users",
      value: "342",
      change: "+5% from last week",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'image',
      title: 'New image generated: Sunset Beach',
      time: '2 minutes ago',
      icon: <ImageIcon className="h-4 w-4 text-blue-500" />,
    },
    {
      id: '2',
      type: 'video',
      title: 'Video processing completed: Mountain Range',
      time: '1 hour ago',
      icon: <Video className="h-4 w-4 text-purple-500" />,
    },
    {
      id: '3',
      type: 'settings',
      title: 'Model settings updated',
      time: '3 hours ago',
      icon: <Settings className="h-4 w-4 text-yellow-500" />,
    },
    {
      id: '4',
      type: 'system',
      title: 'System update completed',
      time: '1 day ago',
      icon: <Zap className="h-4 w-4 text-green-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your account.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Generation
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your recent generations and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              <Button variant="ghost" className="w-full mt-2">
                View all activities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Image
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Video className="mr-2 h-4 w-4" />
                Create Video
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Model Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <LineChart className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Helpful links and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Documentation', description: 'Learn how to use SurfAI features', href: '/documents' },
              { title: 'API Reference', description: 'Integrate with our API', href: '#' },
              { title: 'Community', description: 'Join our community forum', href: '#' },
              { title: 'Support', description: 'Get help from our team', href: '#' },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}