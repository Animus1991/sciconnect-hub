import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="font-serif text-[27px] font-bold text-foreground">404 Not Found</h1>
          </div>

          <p className="mt-4 text-[13px] text-muted-foreground font-display">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link
            to="/"
            className="inline-flex items-center mt-5 h-10 px-5 rounded-xl bg-accent text-accent-foreground text-[13px] font-display font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
