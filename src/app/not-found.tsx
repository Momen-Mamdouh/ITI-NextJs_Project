import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-12">
      <Card className="w-full">
        <CardContent className="py-14 text-center">
          <p className="text-sm font-medium text-muted-foreground">404</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Page not found
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The page you’re looking for doesn’t exist or was moved.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              nativeButton={false}
              render={<Link href="/">Go to home</Link>}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
