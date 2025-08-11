
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SurfPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <Link href="/surf/generate" passHref>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>이미지 & 비디오 생성</span>
              <ArrowRight className="w-5 h-5" />
            </CardTitle>
            <CardDescription>
              AI 이미지 혹은 비디오 등을 생성할 수 있습니다.
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
