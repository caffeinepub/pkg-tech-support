import React, { Suspense, lazy } from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import FloatingChatButton from './components/FloatingChatButton';
import FloatingAIChatButton from './components/FloatingAIChatButton';

const MainContent = lazy(() => import('./components/MainContent'));
const LoginPrompt = lazy(() => import('./components/LoginPrompt'));
const CustomerLogin = lazy(() => import('./components/CustomerLogin'));
const ExpertLogin = lazy(() => import('./components/ExpertLogin'));
const KnowledgeBaseView = lazy(() => import('./components/KnowledgeBaseView'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

function IndexPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showMainContent = isAuthenticated && !profileLoading && userProfile !== null && userProfile !== undefined;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {!isAuthenticated && <LoginPrompt />}
      {showProfileSetup && (
        <ProfileSetupModal
          isOpen={showProfileSetup}
          onComplete={() => {
            // Profile saved — React Query will refetch and re-render automatically
          }}
        />
      )}
      {showMainContent && userProfile && <MainContent userProfile={userProfile} />}
    </Suspense>
  );
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <FloatingChatButton />
      <FloatingAIChatButton />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
});

const customerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer-login',
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <CustomerLogin />
    </Suspense>
  ),
});

const expertLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expert-login',
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <ExpertLogin />
    </Suspense>
  ),
});

const knowledgeBaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/knowledge-base',
  component: () => (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Suspense fallback={<LoadingSpinner />}>
        <KnowledgeBaseView />
      </Suspense>
    </div>
  ),
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <span className="text-3xl">✅</span>
      </div>
      <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
      <p className="text-muted-foreground mb-6">Your support plan has been activated. Thank you!</p>
      <a href="/" className="text-primary underline">Return to Dashboard</a>
    </div>
  ),
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <span className="text-3xl">❌</span>
      </div>
      <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
      <p className="text-muted-foreground mb-6">Something went wrong with your payment. Please try again.</p>
      <a href="/" className="text-primary underline">Return to Dashboard</a>
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  customerLoginRoute,
  expertLoginRoute,
  knowledgeBaseRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
