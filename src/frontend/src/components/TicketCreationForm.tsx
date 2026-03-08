import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@icp-sdk/core/principal";
import { AlertCircle, Info, Loader2, Ticket } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGetAllAvailableTechnicians } from "../hooks/useQueries";
import { useCreateSupportTicket } from "../hooks/useTickets";

interface TicketCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TicketCreationForm: React.FC<TicketCreationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: technicians, isLoading: loadingTechs } =
    useGetAllAvailableTechnicians();
  const createTicket = useCreateSupportTicket();

  const availableTechs = (technicians ?? []).filter((t) => t.isAvailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTechnician) {
      setError("Please select a technician to continue.");
      return;
    }

    try {
      const techPrincipal = Principal.fromText(selectedTechnician);
      await createTicket.mutateAsync(techPrincipal);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Payment must be completed")) {
        // Backend still has payment guard — show a friendly message but don't block
        setError(
          "The system requires payment to be configured. Please contact the support administrator.",
        );
      } else if (msg.includes("Rate limit")) {
        setError("Please wait a few minutes before creating another ticket.");
      } else if (msg.includes("not currently available")) {
        setError(
          "The selected technician is not currently available. Please choose another.",
        );
        setSelectedTechnician("");
      } else {
        setError(msg || "Failed to create ticket. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Free ticket notice */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            Free to Create
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            Support tickets are free to open. Payment is only required if your
            expert requests it during the session.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="technician" className="text-foreground font-medium">
            Select Available Expert
          </Label>
          {loadingTechs ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading available experts…
            </div>
          ) : availableTechs.length === 0 ? (
            <div
              className="flex items-center gap-2 p-3 rounded-xl border"
              style={{
                background: "oklch(0.70 0.20 45 / 0.08)",
                borderColor: "oklch(0.70 0.20 45 / 0.30)",
              }}
            >
              <AlertCircle
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--warning)" }}
              />
              <p className="text-sm" style={{ color: "var(--warning)" }}>
                No experts are currently available. Please try again later.
              </p>
            </div>
          ) : (
            <Select
              value={selectedTechnician}
              onValueChange={setSelectedTechnician}
            >
              <SelectTrigger
                className="bg-background border-border"
                data-ocid="ticket.select"
              >
                <SelectValue placeholder="Choose an available expert" />
              </SelectTrigger>
              <SelectContent>
                {availableTechs.map((tech) => (
                  <SelectItem
                    key={tech.technician.toString()}
                    value={tech.technician.toString()}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      Expert {tech.technician.toString().slice(0, 10)}…
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {error && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl border"
            data-ocid="ticket.error_state"
            style={{
              background: "oklch(0.55 0.22 25 / 0.08)",
              borderColor: "oklch(0.55 0.22 25 / 0.30)",
            }}
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 mt-0.5"
              style={{ color: "var(--destructive)" }}
            />
            <p className="text-sm" style={{ color: "var(--destructive)" }}>
              {error}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={createTicket.isPending}
              data-ocid="ticket.cancel_button"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 btn-primary gap-2"
            disabled={
              availableTechs.length === 0 ||
              loadingTechs ||
              createTicket.isPending
            }
            data-ocid="ticket.submit_button"
          >
            {createTicket.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Ticket className="h-4 w-4" />
                Create Ticket
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreationForm;
