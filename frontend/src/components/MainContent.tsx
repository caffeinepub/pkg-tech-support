import { UserProfile } from '../backend';
import CustomerDashboard from './CustomerDashboard';
import ExpertDashboard from './ExpertDashboard';

interface MainContentProps {
  userProfile: UserProfile;
}

export default function MainContent({ userProfile }: MainContentProps) {
  return (
    <div>
      <div className="container py-6 text-center">
        <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-teal-700 to-cyan-700 dark:from-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
          {userProfile.isTechnician ? 'Expert Dashboard' : 'Customer Dashboard'}
        </h2>
        <p className="text-muted-foreground">
          Welcome back, <span className="font-semibold text-teal-700 dark:text-teal-300">{userProfile.displayName}</span>
        </p>
      </div>
      {userProfile.isTechnician ? (
        <ExpertDashboard />
      ) : (
        <CustomerDashboard />
      )}
    </div>
  );
}
