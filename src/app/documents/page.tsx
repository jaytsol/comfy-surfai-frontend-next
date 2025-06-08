import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Settings, Image as ImageIcon, Video, Zap, Users, FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">SurfAI Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Learn how to create stunning AI-generated images and videos with our comprehensive guides
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Getting Started</CardTitle>
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <CardDescription>New to SurfAI? Start here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Learn the basics of creating AI-generated content with our step-by-step guide.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Guide</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Image Generation</CardTitle>
              <ImageIcon className="h-6 w-6 text-green-500" />
            </div>
            <CardDescription>Create stunning AI images</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Master the art of prompt engineering for the best image generation results.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Learn More</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Video Creation</CardTitle>
              <Video className="h-6 w-6 text-purple-500" />
            </div>
            <CardDescription>Bring your ideas to life</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Learn how to create engaging video content with our AI-powered tools.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Documentation</CardTitle>
              <FileText className="h-6 w-6 text-yellow-500" />
            </div>
            <CardDescription>Integrate with our API</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access our comprehensive API documentation for developers.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Docs</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Collaboration</CardTitle>
              <Users className="h-6 w-6 text-pink-500" />
            </div>
            <CardDescription>Work together seamlessly</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Learn how to collaborate with your team on creative projects.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Learn More</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Advanced Settings</CardTitle>
              <Settings className="h-6 w-6 text-gray-500" />
            </div>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Explore advanced settings and configurations for power users.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Configure</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-muted/50 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-6">
          Our support team is here to help you get the most out of SurfAI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="w-full sm:w-auto">Contact Support</Button>
          <Button variant="outline" className="w-full sm:w-auto">
            Visit Community
          </Button>
        </div>
      </div>
    </div>
  );
}
