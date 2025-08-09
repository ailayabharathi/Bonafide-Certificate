import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MadeWithDyad } from '@/components/made-with-dyad';

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
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
           <div className="text-center">
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
      </main>
      <Footer />
      <MadeWithDyad />
    </div>
  );
};

export default LoginPage;