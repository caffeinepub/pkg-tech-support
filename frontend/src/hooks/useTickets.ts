import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { TicketStatusOld, SupportTicket } from '../backend';

export function useGetUserTickets() {
  const { actor, isFetching } = useActor();
  return useQuery<SupportTicket[]>({
    queryKey: ['userTickets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserTickets();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGetAdminTickets() {
  const { actor, isFetching } = useActor();
  return useQuery<SupportTicket[]>({
    queryKey: ['adminTickets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminTickets();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGetTicket(ticketId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<SupportTicket | null>({
    queryKey: ['ticket', ticketId?.toString()],
    queryFn: async () => {
      if (!actor || ticketId === null) return null;
      return actor.getTicket(ticketId);
    },
    enabled: !!actor && !isFetching && ticketId !== null,
    refetchInterval: 5000,
  });
}

export function useUpdateTicketStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: bigint; status: TicketStatusOld }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTicketStatus(ticketId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
    },
  });
}
