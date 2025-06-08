import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">페이지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground">
          요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다.
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
