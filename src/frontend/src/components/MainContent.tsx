import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Wifi, WifiOff } from "lucide-react";
import React from "react";
import type { UserProfile } from "../backend";
import { useSetTechnicianAvailability } from "../hooks/useQueries";
import CustomerDashboard from "./CustomerDashboard";
import ExpertDashboard from "./ExpertDashboard";

interface MainContentProps {
  userProfile: UserProfile;
}

// Simple error boundary for dashboard content
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "oklch(0.55 0.22 25 / 0.12)" }}
            >
              <span className="text-2xl">⚠️</span>
            </div>
            <h3
              className="font-semibold text-lg mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Something went wrong
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              {this.state.error ||
                "An unexpected error occurred. Please refresh the page."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-2"
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// Online/offline toggle — only visible for technicians
const ExpertAvailabilityToggle: React.FC = () => {
  const [isAvailable, setIsAvailable] = React.useState(false);
  const setAvailability = useSetTechnicianAvailability();

  const handleToggle = async (checked: boolean) => {
    setIsAvailable(checked);
    try {
      await setAvailability.mutateAsync(checked);
    } catch {
      setIsAvailable(!checked);
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-xl border"
      style={{
        background: isAvailable
          ? "oklch(0.58 0.18 145 / 0.10)"
          : "oklch(0.55 0.22 25 / 0.08)",
        borderColor: isAvailable
          ? "oklch(0.58 0.18 145 / 0.35)"
          : "oklch(0.55 0.22 25 / 0.25)",
      }}
    >
      {isAvailable ? (
        <Wifi className="h-4 w-4" style={{ color: "var(--success)" }} />
      ) : (
        <WifiOff className="h-4 w-4" style={{ color: "var(--destructive)" }} />
      )}
      <Label
        htmlFor="availability-toggle"
        className="text-sm font-medium cursor-pointer"
        style={{
          color: isAvailable ? "var(--success)" : "var(--muted-foreground)",
        }}
      >
        {isAvailable ? "Online" : "Offline"}
      </Label>
      <Switch
        id="availability-toggle"
        checked={isAvailable}
        onCheckedChange={handleToggle}
        disabled={setAvailability.isPending}
        data-ocid="expert.availability_toggle"
      />
    </div>
  );
};

export default function MainContent({ userProfile }: MainContentProps) {
  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 140px)" }}>
      {/* Dashboard header bar */}
      <div
        className="border-b px-4 py-3 flex items-center justify-between gap-4"
        style={{
          borderColor: "var(--border)",
          background: userProfile.isTechnician
            ? "linear-gradient(135deg, oklch(0.52 0.18 145 / 0.06) 0%, oklch(0.52 0.18 195 / 0.06) 100%)"
            : "linear-gradient(135deg, oklch(0.52 0.18 195 / 0.06) 0%, oklch(0.55 0.16 265 / 0.06) 100%)",
        }}
      >
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {userProfile.isTechnician
              ? "🛠️ Expert Dashboard"
              : "🙋 Customer Dashboard"}
          </h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Welcome back,{" "}
            <span className="font-semibold" style={{ color: "var(--primary)" }}>
              {userProfile.displayName}
            </span>
          </p>
        </div>

        {userProfile.isTechnician && <ExpertAvailabilityToggle />}
      </div>

      {/* Dashboard content */}
      <div className="flex-1 overflow-hidden">
        <DashboardErrorBoundary>
          {userProfile.isTechnician ? (
            <ExpertDashboard />
          ) : (
            <CustomerDashboard />
          )}
        </DashboardErrorBoundary>
      </div>
    </div>
  );
}
