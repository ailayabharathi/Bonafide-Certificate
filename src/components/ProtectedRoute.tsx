import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Skeleton className="h-16 w-16 rounded-full mb-4" />
        <Skeleton className="h-4 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If profile exists but is incomplete, and we are NOT on the profile page, redirect them.
  if (profile && (!profile.first_name || !profile.last_name) && location.pathname !== '/profile') {
    return <Navigate to="/profile" state={{ from: location, message: "Please complete your profile to continue." }} replace />;
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }
  
  if (profile && allowedRoles.includes(profile.role)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <p>Verifying access...</p>
    </div>
  );
};

export default ProtectedRoute;