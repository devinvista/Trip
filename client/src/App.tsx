
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthProvider } from "@/hooks/use-auth";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import BoardPage from "@/pages/board-page";
import SearchPage from "@/pages/search-page";
import CreateTripPage from "@/pages/create-trip-page";
import EditTripPage from "@/pages/edit-trip-page";
import TripDetailPage from "@/pages/trip-detail-page";
import ChatPage from "@/pages/chat-page";
import JourneyTrackerPage from "@/pages/journey-tracker-page";
import ProfilePage from "@/pages/profile";
import PreloaderDemo from "@/pages/preloader-demo";
import ActivitiesPage from "@/pages/activities-page";
import ActivityDetailPage from "@/pages/activity-detail-page";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";

import NotFound from "@/pages/not-found";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <ErrorBoundary>
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/auth" component={AuthPage} />
                  <Route path="/dashboard" component={DashboardPage} />
                  <Route path="/board" component={BoardPage} />
                  <Route path="/search" component={SearchPage} />
                  <Route path="/create-trip" component={CreateTripPage} />
                  <Route path="/edit-trip/:id" component={EditTripPage} />
                  <Route path="/trip/:id" component={TripDetailPage} />
                  <Route path="/chat/:tripId" component={ChatPage} />
                  <Route path="/journey-tracker" component={JourneyTrackerPage} />
                  <Route path="/profile" component={ProfilePage} />
                  <Route path="/preloader-demo" component={PreloaderDemo} />
                  <Route path="/activities" component={ActivitiesPage} />
                  <Route path="/activities/:id" component={ActivityDetailPage} />
                  <Route path="/privacy-policy" component={PrivacyPolicy} />
                  <Route path="/terms-of-service" component={TermsOfService} />

                  <Route component={NotFound} />
                </Switch>
              </ErrorBoundary>
            </div>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
