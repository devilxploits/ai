import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="w-full flex items-center justify-center p-8 min-h-[70vh]">
      <Card className="w-full max-w-md bg-dark-card border-dark-lighter">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-light">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-light-dimmed">
            The page you're looking for doesn't exist. Please check the URL or return to the home page.
          </p>
          
          <a href="/" className="inline-block mt-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition">
            Go to Home
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
