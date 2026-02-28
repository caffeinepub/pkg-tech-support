import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PaymentToggleState, ToggleStatus } from '../backend';

/**
 * Fetch the full payment toggle state for a given ticket.
 * Polls every 5 seconds so the customer side detects changes in real-time.
 */
export function useGetToggleState(ticketId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentToggleState | null>({
    queryKey: ['paymentToggleState', ticketId?.toString()],
    queryFn: async () => {
      if (!actor || ticketId === null) return null;
      return actor.getToggleState(ticketId);
    },
    enabled: !!actor && !isFetching && ticketId !== null,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

/**
 * Fetch the simplified toggle status (enabled/disabled/notRequested) for a ticket.
 */
export function useGetPersistentToggleState(ticketId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ToggleStatus>({
    queryKey: ['persistentToggleState', ticketId?.toString()],
    queryFn: async () => {
      if (!actor || ticketId === null) return ToggleStatus.notRequested;
      return actor.getPersistentToggleState(ticketId);
    },
    enabled: !!actor && !isFetching && ticketId !== null,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

/**
 * Mutation to set the payment toggle state for a ticket.
 * Only the assigned technician may call this.
 */
export function useSetToggleState(ticketId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toggleEnabled,
      paymentRequested,
      stripeSessionId,
    }: {
      toggleEnabled: boolean;
      paymentRequested: boolean;
      stripeSessionId?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (ticketId === null) throw new Error('No ticket selected');
      await actor.setToggleState(
        ticketId,
        toggleEnabled,
        paymentRequested,
        stripeSessionId ?? null
      );
    },
    onSuccess: () => {
      if (ticketId !== null) {
        queryClient.invalidateQueries({
          queryKey: ['paymentToggleState', ticketId.toString()],
        });
        queryClient.invalidateQueries({
          queryKey: ['persistentToggleState', ticketId.toString()],
        });
      }
    },
  });
}
