import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Card } from '@/components/ui/card';

const LoginPage = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate('/');
    }
  }, [session, loading, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl grid lg:grid-cols-2 shadow-2xl overflow-hidden">
          <div className="p-8 flex flex-col justify-center">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-2xl font-bold text-card-foreground">Student & Staff Portal</h1>
              <p className="text-muted-foreground">Sign in or create an account to continue</p>
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme="light"
              providers={[]}
              redirectTo={`${window.location.origin}/`}
              showLinks={true}
            />
          </div>
          <div className="hidden lg:block">
            <img
              src="https://www.adhiyamaan.ac.in/wp-content/uploads/2023/08/DJI_0010-scaled.jpg"
              alt="Adhiyamaan College of Engineering"
              className="h-full w-full object-cover"
            />
          </div>
        </Card>
      </main>
      <Footer />
      <MadeWithDyad />
    </div>
  );
};

export default LoginPage;