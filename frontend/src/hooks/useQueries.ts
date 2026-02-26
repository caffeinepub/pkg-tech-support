import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, ChatMessage, SupportTicket, ShoppingItem, TechnicianAvailability, ExternalBlob, LoginEvent } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Login Tracking Queries (Admin only - read access)
export function useGetLoginEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<LoginEvent[]>({
    queryKey: ['loginEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLoginEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLoginEventsCSV() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['loginEventsCSV'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLoginEventsCSV();
    },
    enabled: false, // Only fetch when explicitly called
  });
}

// Message Queries - Real-time with aggressive polling
export function useGetUserMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['userMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 300,
    staleTime: 0,
  });
}

export function useGetMessagesBetweenUsers(user1: Principal | null, user2: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['messagesBetween', user1?.toString(), user2?.toString()],
    queryFn: async () => {
      if (!actor || !user1 || !user2) return [];
      return actor.getMessagesBetweenUsers(user1, user2);
    },
    enabled: !!actor && !isFetching && !!user1 && !!user2,
    refetchInterval: 300,
    staleTime: 0,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content, attachment }: { recipient: Principal; content: string; attachment?: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(recipient, content, attachment || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMessages'] });
      queryClient.invalidateQueries({ queryKey: ['messagesBetween'] });
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      queryClient.refetchQueries({ queryKey: ['userMessages'] });
      queryClient.refetchQueries({ queryKey: ['messagesBetween'] });
    },
  });
}

export function useMarkMessagesAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user1, user2 }: { user1: Principal; user2: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markMessagesAsRead(user1, user2);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMessages'] });
      queryClient.invalidateQueries({ queryKey: ['messagesBetween'] });
      queryClient.refetchQueries({ queryKey: ['userMessages'] });
      queryClient.refetchQueries({ queryKey: ['messagesBetween'] });
    },
  });
}

// Support Ticket Queries
export function useGetUserTickets() {
  const { actor, isFetching } = useActor();

  return useQuery<SupportTicket[]>({
    queryKey: ['userTickets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserTickets();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 1000,
    staleTime: 0,
  });
}

export function useCreateSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (technician: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSupportTicket(technician);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      queryClient.refetchQueries({ queryKey: ['userTickets'] });
    },
  });
}

export function useUpdateTicketStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: bigint; status: any }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateTicketStatus(ticketId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      queryClient.refetchQueries({ queryKey: ['userTickets'] });
    },
  });
}

// Technician Availability
export function useSetTechnicianAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isAvailable: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setTechnicianAvailability(isAvailable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onlineExperts'] });
      queryClient.invalidateQueries({ queryKey: ['technicianAvailability'] });
      queryClient.invalidateQueries({ queryKey: ['allTechnicians'] });
      queryClient.refetchQueries({ queryKey: ['onlineExperts'] });
      queryClient.refetchQueries({ queryKey: ['technicianAvailability'] });
    },
  });
}

// Type for online experts with profile information
export type OnlineExpert = {
  expert: Principal;
  profile: UserProfile;
  isAvailable: boolean;
};

export function useGetOnlineExperts() {
  const { actor, isFetching } = useActor();

  return useQuery<OnlineExpert[]>({
    queryKey: ['onlineExperts'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get all available technicians
      const technicians = await actor.getAllAvailableTechnicians();
      
      // Filter only available ones and fetch their profiles
      const onlineExperts: OnlineExpert[] = [];
      
      for (const tech of technicians) {
        if (tech.isAvailable) {
          const profile = await actor.getUserProfile(tech.technician);
          if (profile) {
            onlineExperts.push({
              expert: tech.technician,
              profile: profile,
              isAvailable: tech.isAvailable,
            });
          }
        }
      }
      
      return onlineExperts;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 500,
    staleTime: 0,
  });
}

export function useGetAllAvailableTechnicians() {
  const { actor, isFetching } = useActor();

  return useQuery<TechnicianAvailability[]>({
    queryKey: ['technicianAvailability'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAvailableTechnicians();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 500,
    staleTime: 0,
  });
}

export function useGetTechnicianAvailability(technician: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<TechnicianAvailability | null>({
    queryKey: ['technicianAvailability', technician?.toString()],
    queryFn: async () => {
      if (!actor || !technician) return null;
      return actor.getTechnicianAvailability(technician);
    },
    enabled: !!actor && !isFetching && !!technician,
    refetchInterval: 500,
    staleTime: 0,
  });
}

// Feedback/Rating
export function useSubmitRating() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ rating, comment }: { rating: bigint; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitRating(rating, comment);
    },
  });
}

// Payment Queries
export type CheckoutSession = {
  id: string;
  url: string;
};

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}?payment=success`;
      const cancelUrl = `${baseUrl}?payment=cancelled`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      return session;
    },
  });
}

export function useCreateSupportCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}?payment=success`;
      const cancelUrl = `${baseUrl}?payment=cancelled`;
      const result = await actor.createSupportCheckoutSession(successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      return session;
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
