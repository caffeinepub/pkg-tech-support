import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, SupportTicket, KBArticle, KnowledgeCategory, ShoppingItem } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

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
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Technician Availability ─────────────────────────────────────────────────

export function useGetAllAvailableTechnicians() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['availableTechnicians'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAvailableTechnicians();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useSetTechnicianAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isAvailable: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setTechnicianAvailability(isAvailable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTechnicians'] });
    },
  });
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export function useGetChatMessages(ticketId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['chatMessages', ticketId?.toString()],
    queryFn: async () => {
      if (!actor || ticketId === null) return [];
      return actor.getChatMessages(ticketId);
    },
    enabled: !!actor && !isFetching && ticketId !== null,
    refetchInterval: 3000,
  });
}

export function useSendMessageForTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      content,
    }: {
      ticketId: bigint;
      content: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessageForTicket(ticketId, content, null);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chatMessages', variables.ticketId.toString()],
      });
    },
  });
}

export function useMarkTicketMessagesAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTicketMessagesAsRead(ticketId);
    },
    onSuccess: (_data, ticketId) => {
      queryClient.invalidateQueries({
        queryKey: ['chatMessages', ticketId.toString()],
      });
    },
  });
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export function useGetAllKBArticles() {
  const { actor, isFetching } = useActor();

  return useQuery<KBArticle[]>({
    queryKey: ['kbArticles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKBArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetKBArticle(articleId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<KBArticle | null>({
    queryKey: ['kbArticle', articleId?.toString()],
    queryFn: async () => {
      if (!actor || articleId === null) return null;
      return actor.getKBArticle(articleId);
    },
    enabled: !!actor && !isFetching && articleId !== null,
  });
}

export function useSearchKBArticles(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<KBArticle[]>({
    queryKey: ['kbSearch', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchKBArticles(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useGetArticlesByCategory(category: KnowledgeCategory | null) {
  const { actor, isFetching } = useActor();

  return useQuery<KBArticle[]>({
    queryKey: ['kbByCategory', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getArticlesByCategory(category);
    },
    enabled: !!actor && !isFetching && category !== null,
  });
}

export function useCreateKBArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      category,
      body,
      tags,
    }: {
      title: string;
      category: KnowledgeCategory;
      body: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createKBArticle(title, category, body, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });
}

export function useUpdateKBArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      articleId,
      title,
      category,
      body,
      tags,
    }: {
      articleId: bigint;
      title: string;
      category: KnowledgeCategory;
      body: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateKBArticle(articleId, title, category, body, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });
}

export function useDeleteKBArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteKBArticle(articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });
}

export function useIncrementArticleViewCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementArticleViewCount(articleId);
    },
    onSuccess: (_data, articleId) => {
      queryClient.invalidateQueries({ queryKey: ['kbArticle', articleId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useGetAnalyticsMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['analyticsMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalyticsMetrics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

// ─── Login Events ─────────────────────────────────────────────────────────────

export function useGetLoginEvents() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['loginEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLoginEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Returns a mutation — call `mutateAsync()` to fetch and download the CSV. */
export function useGetLoginEventsCSV() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (): Promise<string> => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLoginEventsCSV();
    },
  });
}

// ─── Payment ──────────────────────────────────────────────────────────────────

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

export function useCreateSupportCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createSupportCheckoutSession(successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) throw new Error('Stripe session missing url');
      return session;
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) throw new Error('Stripe session missing url');
      return session;
    },
  });
}

// ─── Customer History ─────────────────────────────────────────────────────────

export function useGetCustomerHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SupportTicket[]>({
    queryKey: ['customerHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomerHistory();
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 15000,
    staleTime: 5000,
  });
}

// ─── Expert History ───────────────────────────────────────────────────────────

export function useGetExpertHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SupportTicket[]>({
    queryKey: ['expertHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpertHistory();
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 15000,
    staleTime: 5000,
  });
}
