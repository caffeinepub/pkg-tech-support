import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, LayoutDashboard, MessageSquare } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { TicketStatusOld } from "../backend";
import { useGetToggleState } from "../hooks/usePaymentToggle";
import { useGetUserTickets } from "../hooks/useTickets";
import ChatSection from "./ChatSection";
import ClientPortal from "./ClientPortal";
import PaymentRequestModal from "./PaymentRequestModal";
import PaymentSection from "./PaymentSection";

// Polls the active ticket's payment toggle and shows modal when enabled
const PaymentModalController: React.FC = () => {
  const { data: tickets } = useGetUserTickets();
  const [modalShown, setModalShown] = useState(false);

  const activeTicket = tickets
    ? ([...tickets]
        .filter(
          (t) =>
            t.status === TicketStatusOld.open ||
            t.status === TicketStatusOld.inProgress,
        )
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0] ?? null)
    : null;

  const ticketId = activeTicket?.ticketId ?? null;
  const { data: toggleState } = useGetToggleState(ticketId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: modalShown excluded intentionally to avoid infinite loop
  useEffect(() => {
    if (toggleState?.toggleEnabled && !modalShown) {
      setModalShown(true);
    }
    if (!toggleState?.toggleEnabled) {
      setModalShown(false);
    }
  }, [toggleState?.toggleEnabled]);

  return (
    <PaymentRequestModal
      isOpen={modalShown}
      onClose={() => setModalShown(false)}
      ticketId={ticketId}
      amount={299}
    />
  );
};

const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("portal");

  return (
    <div className="flex flex-col h-full">
      {/* Payment modal controller */}
      <PaymentModalController />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Colorful customer tab bar */}
        <div
          className="border-b px-2 pt-2"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(135deg, oklch(0.52 0.18 195 / 0.08) 0%, oklch(0.55 0.16 265 / 0.08) 100%)",
          }}
        >
          <TabsList
            className="grid grid-cols-3 w-full"
            style={{ background: "oklch(0.52 0.18 195 / 0.10)" }}
          >
            <TabsTrigger
              value="portal"
              className="gap-1 text-xs data-[state=active]:text-white data-[state=active]:shadow-sm"
              style={
                activeTab === "portal" ? { background: "var(--primary)" } : {}
              }
              data-ocid="customer.tabs.tab"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">My Tickets</span>
              <span className="sm:hidden">Tickets</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="gap-1 text-xs data-[state=active]:text-white data-[state=active]:shadow-sm"
              style={
                activeTab === "chat"
                  ? { background: "oklch(0.52 0.18 145)" }
                  : {}
              }
              data-ocid="customer.tabs.tab"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="gap-1 text-xs data-[state=active]:text-white data-[state=active]:shadow-sm"
              style={
                activeTab === "payment"
                  ? { background: "oklch(0.55 0.16 265)" }
                  : {}
              }
              data-ocid="customer.tabs.tab"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Payment</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="portal" className="flex-1 overflow-hidden mt-0">
          <ClientPortal />
        </TabsContent>

        <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
          <ChatSection />
        </TabsContent>

        <TabsContent
          value="payment"
          className="flex-1 overflow-y-auto mt-0 p-4"
        >
          <PaymentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
