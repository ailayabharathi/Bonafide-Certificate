import { Link } from "react-router-dom";
import { Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Frown className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">404 - Page Not Found</CardTitle>
          <CardDescription className="text-lg">
            Oops! The page you're looking for doesn't seem to exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            It might have been moved, deleted, or maybe you just mistyped the URL.
          </p>
          <Button asChild>
            <Link to="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;