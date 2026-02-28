import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PaymentToggleState } from '../backend';

export function useGetToggleState(ticketId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentToggleState | null>({
    queryKey: ['toggleState', ticketId?.toString()],
    queryFn: async () => {
      if (!actor || ticketId === null) return null;
      return actor.getToggleState(ticketId);
    },
    enabled: !!actor && !isFetching && ticketId !== null,
    refetchInterval: 5000,
  });
}

export function useGetPersistentToggleState(ticketId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['persistentToggleState', ticketId?.toString()],
    queryFn: async () => {
      if (!actor || ticketId === null) return null;
      return actor.getPersistentToggleState(ticketId);
    },
    enabled: !!actor && !isFetching && ticketId !== null,
    refetchInterval: 5000,
  });
}

export function useSetToggleState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      toggleEnabled,
      paymentRequested,
      stripeSessionId,
    }: {
      ticketId: bigint;
      toggleEnabled: boolean;
      paymentRequested: boolean;
      stripeSessionId: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setToggleState(ticketId, toggleEnabled, paymentRequested, stripeSessionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['toggleState', variables.ticketId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['persistentToggleState', variables.ticketId.toString()],
      });
    },
  });
}
