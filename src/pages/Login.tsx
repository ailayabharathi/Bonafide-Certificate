import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";

const Login = () => {
  const { session } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-1 text-card-foreground">Bonafide Certificate Portal</h2>
            <p className="text-center text-muted-foreground mb-6">Sign in to continue</p>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              theme={theme === 'dark' ? 'dark' : 'light'}
              localization={{
                variables: {
                  sign_up: {
                    email_label: 'Email address',
                    password_label: 'Create a password',
                    button_label: 'Sign up',
                    social_provider_text: 'Sign in with {{provider}}',
                    link_text: 'Already have an account? Sign in',
                    additional_data: {
                      first_name: 'First Name',
                      last_name: 'Last Name',
                      register_number: 'Register Number',
                      department: 'Department',
                    }
                  },
                  sign_in: {
                    email_label: 'Email address',
                    password_label: 'Your password',
                    button_label: 'Sign in',
                    social_provider_text: 'Sign in with {{provider}}',
                    link_text: 'Don\'t have an account? Sign up',
                  }
                }
              }}
              view="sign_in"
              showLinks={true}
            />
        </div>
      </div>
    </div>
  );
};

export default Login;