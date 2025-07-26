
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SurfPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <Link href="/surf/generate" passHref>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Image Generation</span>
              <ArrowRight className="w-5 h-5" />
            </CardTitle>
            <CardDescription>
              Create images from text prompts using AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* You can add more content here if needed */}
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}
