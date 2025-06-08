import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { History as HistoryIcon, Image as ImageIcon, Video, Clock, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type GenerationType = 'image' | 'video';

interface GenerationItem {
  id: string;
  type: GenerationType;
  title: string;
  date: string;
  thumbnail: string;
  status: 'completed' | 'processing' | 'failed';
}

// Mock data - replace with actual API calls
const mockGenerations: GenerationItem[] = [
  {
    id: '1',
    type: 'image',
    title: 'Mountain Landscape',
    date: '2025-06-08T14:30:00',
    thumbnail: '/placeholder-image.jpg',
    status: 'completed'
  },
  {
    id: '2',
    type: 'video',
    title: 'Ocean Waves',
    date: '2025-06-07T10:15:00',
    thumbnail: '/placeholder-video.jpg',
    status: 'completed'
  },
  {
    id: '3',
    type: 'image',
    title: 'City Sunset',
    date: '2025-06-06T18:45:00',
    thumbnail: '/placeholder-image.jpg',
    status: 'completed'
  },
];

function GenerationCard({ item }: { item: GenerationItem }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          {item.type === 'image' ? (
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          ) : (
            <Video className="h-12 w-12 text-muted-foreground/50" />
          )}
        </div>
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <h3 className="font-medium line-clamp-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(item.date).toLocaleString()}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            item.status === 'completed' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : item.status === 'processing' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Download</span>
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HistoryIcon className="h-8 w-8" />
          Generation History
        </h1>
        <p className="text-muted-foreground">
          View and manage your previously generated images and videos
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Generations</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Sort
            </Button>
          </div>
        </div>

        {mockGenerations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockGenerations.map((item) => (
              <GenerationCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No generations yet</h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              Your generated content will appear here
            </p>
            <Button>Generate Now</Button>
          </div>
        )}
      </div>
    </div>
  );
}
