import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PlaceholderLogin = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Login Page Placeholder</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This is a temporary login page. The actual login functionality is currently being debugged.
      </p>
      <Button asChild>
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  );
};

export default PlaceholderLogin;