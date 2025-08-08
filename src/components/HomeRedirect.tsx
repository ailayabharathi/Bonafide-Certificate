import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import { Skeleton } from '@/components/ui/skeleton';

const HomeRedirect = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session && profile) {
      navigate(`/${profile.role}/dashboard`);
    }
  }, [session, profile, loading, navigate]);

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
    return <Index />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <p>Redirecting to your dashboard...</p>
    </div>
  );
};

export default HomeRedirect;