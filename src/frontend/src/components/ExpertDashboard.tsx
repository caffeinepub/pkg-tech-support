import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  BookOpen,
  MessageSquare,
  Shield,
  Ticket,
} from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import type { SupportTicket } from "../backend";
import AdminLoginTracking from "./AdminLoginTracking";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ChatSection from "./ChatSection";
import KnowledgeBaseView from "./KnowledgeBaseView";
import TicketListView from "./TicketListView";

const ExpertDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tickets");
  const [chatTicket, setChatTicket] = useState<SupportTicket | null>(null);

  // When expert clicks a ticket in the list, open it in chat tab
  const handleOpenChat = useCallback((ticket: SupportTicket) => {
    setChatTicket(ticket);
    setActiveTab("chat");
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Colorful expert tab bar */}
        <div
          className="border-b px-2 pt-2"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(135deg, oklch(0.52 0.18 145 / 0.08) 0%, oklch(0.52 0.18 195 / 0.08) 100%)",
          }}
        >
          <TabsList
            className="grid grid-cols-5 w-full"
            style={{ background: "oklch(0.52 0.18 145 / 0.10)" }}
          >
            <TabsTrigger
              value="tickets"
              className="gap-1 text-xs data-[state=active]:text-white data-[state=active]:shadow-sm"
              style={
                activeTab === "tickets"
                  ? { background: "oklch(0.70 0.20 45)" }
                  : {}
              }
              data-ocid="expert.tabs.tab"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="gap-1 text-xs data-[state=active]:text-white data-[state=active]:shadow-sm"
              style={
                activeTab === "chat" ? { background: "var(--primary)" } : {}
              }
              data-ocid="expert.tabs.tab"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="gap-1 text-xs data-[state=active]:text-white data-[state=active]:shadow-sm"
              style={
                activeTab === "analytics"
                  ? { background: "oklch(0.52 0.18 145)" }
                  : {}
              }
              data-ocid="expert.tabs.tab"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="kb"
              className="gap-1 text-xs data-[state=active]:text-white data-[state=active]:shadow-sm"
              style={
                activeTab === "kb" ? { background: "oklch(0.55 0.16 265)" } : {}
              }
              data-ocid="expert.tabs.tab"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">KB</span>
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="gap-1 text-xs data-[state=active]:text-white data-[state=active]:shadow-sm"
              style={
                activeTab === "admin"
                  ? { background: "oklch(0.55 0.22 25)" }
                  : {}
              }
              data-ocid="expert.tabs.tab"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="tickets"
          className="flex-1 overflow-y-auto mt-0 p-4"
        >
          <TicketListView showAll={true} onOpenChat={handleOpenChat} />
        </TabsContent>

        <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
          <ChatSection activeTicket={chatTicket} />
        </TabsContent>

        <TabsContent
          value="analytics"
          className="flex-1 overflow-y-auto mt-0 p-4"
        >
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="kb" className="flex-1 overflow-y-auto mt-0 p-4">
          <KnowledgeBaseView />
        </TabsContent>

        <TabsContent value="admin" className="flex-1 overflow-y-auto mt-0 p-4">
          <AdminLoginTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpertDashboard;
