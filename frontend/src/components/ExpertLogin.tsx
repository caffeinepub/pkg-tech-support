import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowLeft, Shield, MessageSquare, Settings, BarChart } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpertLogin() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;

  useEffect(() => {
    // Only redirect after successful login, not on initial mount
    if (isAuthenticated && loginStatus === 'success') {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, loginStatus, navigate]);

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Welcome! Please set up your expert profile.');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        navigate({ to: '/' });
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decorative image */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <img 
          src="/assets/generated/support-technician.dim_400x300.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container py-12 md:py-24 relative z-10">
        <div className="mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/' })}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Image and branding */}
            <div className="space-y-6">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold mb-4 text-violet-800 dark:text-violet-200">
                  Expert Portal
                </h1>
                <p className="text-lg text-violet-700 dark:text-violet-300 mb-6">
                  Help customers solve their technical problems and earn while you support
                </p>
              </div>
              
              <img
                src="/assets/generated/support-technician.dim_400x300.jpg"
                alt="Technical Expert"
                className="rounded-lg shadow-2xl border-4 border-white dark:border-gray-700"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 text-center">
                  <MessageSquare className="h-8 w-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Live Support</p>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 text-center">
                  <Settings className="h-8 w-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Manage Tickets</p>
                </div>
              </div>
            </div>

            {/* Right side - Login card */}
            <Card className="border-2 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Wrench className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-violet-800 dark:text-violet-200">Expert Login</CardTitle>
                <CardDescription className="text-base text-violet-700 dark:text-violet-300">
                  Sign in with Internet Identity to provide technical support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg p-4 space-y-3 border-2 border-violet-200 dark:border-violet-800">
                  <h3 className="font-semibold text-sm text-violet-800 dark:text-violet-200 flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Expert features:
                  </h3>
                  <ul className="space-y-2 text-sm text-violet-700 dark:text-violet-300">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 dark:text-violet-400 mt-0.5">✓</span>
                      <span>Manage customer support requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 dark:text-violet-400 mt-0.5">✓</span>
                      <span>Real-time chat with image sharing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 dark:text-violet-400 mt-0.5">✓</span>
                      <span>Set your availability status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 dark:text-violet-400 mt-0.5">✓</span>
                      <span>Track support history and ratings</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg" 
                  size="lg"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Login with Internet Identity
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By logging in, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
